import aiService from "./ai.service.js";
import rateLimitService from "./rateLimit.service.js";
import fallbackService from "./fallback.service.js";

// Tracks which providers are currently healthy
const providerHealth = {
  GEMINI: { healthy: true, failedAt: null, retryAfter: null },
  GROQ:   { healthy: true, failedAt: null, retryAfter: null },
};

function markUnhealthy(provider, retrySeconds = 60) {
  providerHealth[provider] = {
    healthy:    false,
    failedAt:   Date.now(),
    retryAfter: Date.now() + (retrySeconds * 1000)
  };
  console.error(`[AI Router] ${provider} marked unhealthy`);
}

function checkRecovery(provider) {
  const p = providerHealth[provider];
  if (!p.healthy && Date.now() > p.retryAfter) {
    providerHealth[provider].healthy = true;
    console.log(`[AI Router] ${provider} marked recovered`);
  }
}

function isHealthy(provider) {
  checkRecovery(provider);
  return providerHealth[provider].healthy;
}

const ROUTING = {
  ASSIGNMENT_GENERATION: {
    primary:   'GROQ',
    fallbacks: ['GEMINI'],
    timeout:   30000,
    critical:  false
  },
  ASSIGNMENT_REVIEW: {
    primary:   'GROQ',
    fallbacks: ['GEMINI'],
    timeout:   20000,
    critical:  true
  },
  CAREER_PATH: {
    primary:   'GROQ',
    fallbacks: ['GEMINI'],
    timeout:   90000,
    critical:  true
  },
  RESOURCE_CURATION: {
    primary:   'GROQ',
    fallbacks: ['GEMINI'],
    timeout:   15000,
    critical:  false
  },
  COMPANION_MESSAGE: {
    primary:   'GROQ',
    fallbacks: ['GEMINI'],
    timeout:   20000,
    critical:  false
  }
};

class AIRouterService {

  async _callProvider(provider, jobType, payload, options) {
    const timeoutMs = options.timeout || 15000;

    const executeCall = async () => {
      if (jobType === 'CAREER_PATH') {
        if (provider === 'GROQ') return await aiService.generateRoadmapGroq(payload.profile);
        return await aiService.generateRoadmapGemini(payload.profile);
      }
      if (jobType === 'RESOURCE_CURATION') {
        if (provider === 'GROQ') return await aiService.generateResourcesGroq(payload.skillTag, payload.nodeTitle, payload.nodeDescription);
        return await aiService.generateResourcesGemini(payload.skillTag, payload.nodeTitle, payload.nodeDescription);
      }
      if (jobType === 'ASSIGNMENT_GENERATION') {
        if (provider === 'GROQ') return await aiService.generateAssignmentGroq(payload.nodeTitle, payload.nodeDescription, payload.skillTag);
        return await aiService.generateAssignmentGemini(payload.nodeTitle, payload.nodeDescription, payload.skillTag);
      }
      if (jobType === 'ASSIGNMENT_REVIEW') {
        if (provider === 'GROQ') return await aiService.evaluateSubmissionGroq(payload.assignment, payload.rawContent, payload.isOriginal);
        return await aiService.evaluateSubmissionGemini(payload.assignment, payload.rawContent, payload.isOriginal);
      }
      if (jobType === 'COMPANION_MESSAGE') {
        if (provider === 'GROQ') return await aiService.chatCompanionGroq(payload.history, payload.message, payload.profile);
        return await aiService.chatCompanionGemini(payload.history, payload.message, payload.profile);
      }
      throw new Error(`Unknown job: ${jobType}`);
    };

    return Promise.race([
      executeCall(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${provider} timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  async runAI(jobType, payload, userId, userTier) {
    const route = ROUTING[jobType];
    if (!route) throw new Error(`Unknown job: ${jobType}`);

    // 1. CHECK USER RATE LIMIT
    if (userId) {
      const limitCheck = await rateLimitService.checkUser(userId, jobType, userTier);
      if (!limitCheck.allowed) {
        console.warn(`[AI Router] Rate limit exceeded for user ${userId}: ${limitCheck.message}`);
        return {
          result: fallbackService.getEmergencyResponse(jobType, payload).result,
          fromFallback: true,
          rateLimited: true,
          error: limitCheck.message
        };
      }
    }

    // 2. BUILD PROVIDER CHAIN
    const primaryProvider = route.primary;
    const allProviders = [primaryProvider, ...route.fallbacks].filter(p => isHealthy(p));

    if (allProviders.length === 0) {
      // Still count against their limit even if it goes to manual queue
      if (userId && jobType !== 'ASSIGNMENT_REVIEW') await rateLimitService.increment(userId, jobType, userTier);
      return fallbackService.getEmergencyResponse(jobType, payload);
    }

    let lastError = null;
    // 3. TRY PROVIDERS IN ORDER
    for (const provider of allProviders) {
      const quotaOk = await rateLimitService.checkPlatformQuota(provider);
      if (!quotaOk) {
        console.warn(`[AI Router] ${provider} platform quota exhausted, trying next fallback`);
        lastError = new Error(`${provider} quota exhausted`);
        continue;
      }

      try {
        console.log(`[AI Router] Routing ${jobType} to ${provider}`);
        const result = await this._callProvider(provider, jobType, payload, { timeout: route.timeout });

        // Success - increment counters (skip for ASSIGNMENT_REVIEW as it's done in controller)
        if (userId && jobType !== 'ASSIGNMENT_REVIEW') await rateLimitService.increment(userId, jobType, userTier);
        await rateLimitService.incrementPlatform(provider);

        return { result, provider, fromFallback: false };

      } catch (err) {
        lastError = err;
        console.error(`[AI Router] ${provider} failed for ${jobType}:`, err.message);
        markUnhealthy(provider, 60);
      }
    }

    // 4. ALL PROVIDERS FAILED
    console.error(`[AI Router] All providers failed for ${jobType}`);
    
    // Still count against their limit even if it goes to manual queue
    if (userId && jobType !== 'ASSIGNMENT_REVIEW') await rateLimitService.increment(userId, jobType, userTier);
    
    const emergencyResponse = fallbackService.getEmergencyResponse(jobType, payload);
    return { 
      ...emergencyResponse,
      error: lastError ? lastError.message : 'Unknown timeout or provider failure'
    };
  }
}

export default new AIRouterService();
