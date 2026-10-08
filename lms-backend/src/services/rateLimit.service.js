import UsageRecord from "../models/usageRecord.js";
import PlatformQuota from "../models/platformQuota.js";

const TIER_LIMITS = {
  free: {
    COMPANION_MESSAGE:   { period: 'daily', max: 10 },
    INTERVIEW_QUESTION:  { period: 'daily', max: 2 },
    ASSIGNMENT_REVIEW:   { period: 'daily', max: 5  },
    CAREER_PATH:         { period: 'weekly', max: 3 },
    RESOURCE_CURATION:   { period: 'daily', max: 3  },
  },
  builder: {
    COMPANION_MESSAGE:   { period: 'daily', max: 100 },
    INTERVIEW_QUESTION:  { period: 'daily', max: 5  },
    ASSIGNMENT_REVIEW:   { period: 'daily', max: 20  },
    CAREER_PATH:         { period: 'monthly', max: 999 },
    RESOURCE_CURATION:   { period: 'daily', max: 999 },
  },
  placement: {
    COMPANION_MESSAGE:   { period: 'daily', max: 999 },
    INTERVIEW_QUESTION:  { period: 'daily', max: 999 },
    ASSIGNMENT_REVIEW:   { period: 'daily', max: 999 },
    CAREER_PATH:         { period: 'monthly', max: 999 },
    RESOURCE_CURATION:   { period: 'daily', max: 999 },
  }
};

const PLATFORM_LIMITS = {
  GEMINI: { daily: 1400 },
  GROQ:   { daily: 13000 },
  OLLAMA: { concurrent: 10 }
};

class RateLimitService {

  _getDateKey(period) {
    const now = new Date();
    if (period === 'daily') {
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    if (period === 'weekly') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now - startOfYear) / 86400000;
      return `${now.getFullYear()}-W${Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)}`;
    }
    if (period === 'monthly') {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    return now.toISOString().split('T')[0];
  }

  _getExpireAt(period) {
    const expire = new Date();
    if (period === 'daily') expire.setDate(expire.getDate() + 2); // Keep for 48 hours
    if (period === 'weekly') expire.setDate(expire.getDate() + 14); 
    if (period === 'monthly') expire.setMonth(expire.getMonth() + 2);
    return expire;
  }

  async checkUser(userId, jobType, tier = 'free') {
    const limits = TIER_LIMITS[tier]?.[jobType];
    if (!limits) return { allowed: true };

    const { period, max } = limits;
    const dateKey = this._getDateKey(period);

    const record = await UsageRecord.findOne({ userId, jobType, dateKey });
    const current = record ? record.count : 0;

    if (current >= max) {
      return {
        allowed: false,
        message: this._getMessage(jobType, tier, period, max),
      };
    }

    return { allowed: true, remaining: max - current };
  }

  async increment(userId, jobType, tier = 'free') {
    const limits = TIER_LIMITS[tier]?.[jobType];
    const period = limits ? limits.period : 'daily';
    const dateKey = this._getDateKey(period);
    const expireAt = this._getExpireAt(period);

    await UsageRecord.findOneAndUpdate(
      { userId, jobType, dateKey },
      { 
        $inc: { count: 1 },
        $set: { lastCallAt: new Date(), expireAt }
      },
      { upsert: true, new: true }
    );
  }

  async checkPlatformQuota(provider) {
    // Return true for providers that don't have hard limits specified (or are OLLAMA stub)
    if (!PLATFORM_LIMITS[provider] || provider === 'OLLAMA') return true;

    const dateKey = this._getDateKey('daily');
    const record = await PlatformQuota.findOne({ provider, dateKey });
    const current = record ? record.used : 0;

    return current < PLATFORM_LIMITS[provider].daily;
  }

  async incrementPlatform(provider) {
    if (provider === 'OLLAMA') return;
    const dateKey = this._getDateKey('daily');
    const expireAt = this._getExpireAt('daily');

    await PlatformQuota.findOneAndUpdate(
      { provider, dateKey },
      { 
        $inc: { used: 1 },
        $set: { expireAt }
      },
      { upsert: true, new: true }
    );
  }

  _getMessage(jobType, tier, period, max) {
    const jobName = {
      COMPANION_MESSAGE:  'AI companion messages',
      ASSIGNMENT_REVIEW:  'assignment submissions',
      INTERVIEW_QUESTION: 'interview sessions',
      CAREER_PATH: 'career path regenerations',
      RESOURCE_CURATION: 'resource generations'
    }[jobType] || 'AI requests';

    if (tier === 'free') {
      const upgrade = {
        COMPANION_MESSAGE:  '100 messages per day',
        ASSIGNMENT_REVIEW:  '20 submissions per day',
        INTERVIEW_QUESTION: '5 sessions per day',
        CAREER_PATH: 'unlimited regenerations',
        RESOURCE_CURATION: 'unlimited generations'
      }[jobType] || 'higher limits';

      return `You have used your ${period} limit of ${max} ${jobName}. Upgrade to Builder for ${upgrade}.`;
    }
    return `${jobName} limit reached.`;
  }
}

export default new RateLimitService();
