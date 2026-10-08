import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import { TRUSTED_SOURCES } from "../config/trustedSources.js";

// Initialize SDKs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });

// ─── VALIDATION SCHEMA ──────────────────────────────────
const roadmapSchema = z.object({
  skillGaps: z.array(z.string()).min(1).max(10),
  nodes: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(["skill", "project", "milestone"]),
      estimatedHours: z.number().int().min(1).max(200),
      skillTag: z.string(),
      skillDomain: z.string(),
    })
  ).min(1).max(30),
});

const resourceSchema = z.array(
  z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(["video", "course", "article", "interactive", "documentation"]),
    sourceName: z.string(),
    estimatedTime: z.string(),
    description: z.string(),
  })
).length(4);

const evaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  skillLevel: z.enum(["none", "beginner", "intermediate", "advanced"]),
  status: z.enum(["passed", "failed", "flagged_for_review"]),
  criteriaVerdicts: z.array(
    z.object({
      criterion: z.string(),
      status: z.enum(["met", "not_met"]),
      reason: z.string(),
    })
  ),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

class AIService {
  
  _cleanJson(str) {
    let clean = str.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(json)?\n/, "").replace(/\n```$/, "");
    }
    return clean;
  }

  // ─── LAYER 1: PROFILE ANALYZER (GROQ) ──────────────────────────
  async _analyzeProfile(profile) {
    console.log("[Layer 1] Analyzing Profile...");
    const prompt = `
      You are an elite technical recruiter. Analyze this user:
      Dream Role: ${profile.dreamRole}
      Current Level: ${profile.currentLevel}
      Current Skills: ${(profile.currentSkills || []).join(", ") || "None"}
      
      Identify 3 to 6 exact missing skills or tools they need to master to reach their dream role.
      Output ONLY a JSON object with a single key "skillGaps" containing an array of strings.
      Generate a unique variation. Random seed: ${Date.now()}-${Math.random()}
    `;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      const parsed = JSON.parse(this._cleanJson(completion.choices[0].message.content));
      return parsed.skillGaps || ["Advanced Concepts"];
    } catch (e) {
      console.warn("Layer 1 (Groq) failed, falling back to Gemini.", e.message);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const res = await model.generateContent(prompt);
        const parsed = JSON.parse(this._cleanJson(res.response.text()));
        return parsed.skillGaps || ["Advanced Concepts"];
      } catch (geminiError) {
        console.warn("Layer 1 (Gemini Fallback) failed.", geminiError.message);
        return ["Advanced Concepts"];
      }
    }
  }

  // ─── LAYER 2: CURRICULUM ARCHITECT (GEMINI) ────────────────────
  async _buildCurriculum(skillGaps, profile) {
    console.log("[Layer 2] Building Curriculum Tree...");
    const prompt = `
      You are a Curriculum Architect. 
      Target Timeline: ${profile.targetTimelineMonths} months.
      Skill Gaps to cover: ${skillGaps.join(", ")}.
      
      Generate a HIGHLY DETAILED, step-by-step curriculum of "nodes" to bridge these gaps.
      A node type can be "skill", "project", or "milestone".
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate between 12 and 18 nodes. Do NOT generate a short path. Break down complex topics into smaller, atomic skills.
      2. You must group the nodes logically into 3-5 distinct "skillDomain" categories (e.g., "Foundation", "Interface", "Logic", "Data", "Ship").
      3. Include at least 2 "project" nodes and 1 "milestone" node.
      4. Each node must have a short "skillTag" (kebab-case, e.g., "react-hooks", "css-grid").
      5. Make the titles extremely professional and the descriptions specific and detailed.
      6. Provide a unique, creative variation of a learning path (Random Seed: ${Date.now()}-${Math.random()}).
      
      Output ONLY a JSON object with a key "nodes" containing an array of node objects.
      Each node must have:
      - title: string
      - description: string
      - type: "skill" | "project" | "milestone"
      - estimatedHours: number (integer)
      - skillTag: string (e.g. "react-hooks")
      - skillDomain: string (e.g. "Logic")
    `;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      return JSON.parse(this._cleanJson(completion.choices[0].message.content)).nodes;
    } catch (e) {
      console.warn("Layer 2 (Groq) failed, falling back to Gemini.", e.message);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { temperature: 0.8 }
      });
      
      let result;
      let retries = 3;
      while (retries > 0) {
        try {
          result = await model.generateContent(prompt);
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          console.warn(`Layer 2 Gemini failed. Retrying... (${retries} left)`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
      return JSON.parse(this._cleanJson(result.response.text())).nodes;
    }
  }

  // ─── LAYER 3: PERSONALIZATION ENGINE (GEMINI) ────────────────────
  async _personalize(curatedNodes, profile) {
    console.log("[Layer 3] Personalizing Content...");
    // Bypass Groq to prevent array truncation, use Gemini instead
    const prompt = `
      You are a personalized AI tutor. 
      Current Level: ${profile.currentLevel}.
      
      Here is their curriculum:
      ${JSON.stringify(curatedNodes, null, 2)}
      
      Task:
      Rewrite the "description" of each node to speak directly to the user in EXACTLY ONE short, punchy sentence explaining *why* this skill matters for their overarching goal based on their current level.
      Example: "You understand how React renders components, but State management is what makes those components respond to real user actions."
      
      Output ONLY a JSON object with a key "nodes" containing the modified array of exactly ${curatedNodes.length} nodes. Do NOT truncate or remove any nodes.
    `;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      const parsed = JSON.parse(this._cleanJson(completion.choices[0].message.content));
      if (parsed.nodes && parsed.nodes.length === curatedNodes.length) return parsed.nodes;
      return curatedNodes;
    } catch (e) {
      console.warn("Layer 3 (Groq) failed, falling back to Gemini.", e.message);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        let result;
        let retries = 3;
        while (retries > 0) {
          try {
            result = await model.generateContent(prompt);
            break;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            console.warn(`Layer 3 Gemini failed. Retrying... (${retries} left)`);
            await new Promise(r => setTimeout(r, 2000));
          }
        }

        const parsed = JSON.parse(this._cleanJson(result.response.text()));
        
        // Ensure it didn't truncate
        if (parsed.nodes && parsed.nodes.length === curatedNodes.length) {
          return parsed.nodes;
        }
        return curatedNodes; // Bypass on mismatch
      } catch (geminiError) {
        console.warn("Layer 3 (Gemini) failed, bypassing personalization.", geminiError.message);
        return curatedNodes; // Bypass on failure
      }
    }
  }

  // ─── PURE PROVIDER CALLS ─────────────────────────────────────────

  async generateRoadmapGroq(payload) {
    const profile = payload.profile || payload;
    const skillGaps = await this._analyzeProfile(profile);
    const rawNodes = await this._buildCurriculum(skillGaps, profile);
    const personalizedNodes = await this._personalize(rawNodes, profile);
    
    return roadmapSchema.parse({ skillGaps, nodes: personalizedNodes });
  }

  async generateRoadmapGemini(profile) {
    // If we wanted a pure Gemini implementation, it goes here.
    // For now, we reuse the hybrid approach for both since _buildCurriculum uses Gemini.
    return this.generateRoadmapGroq(profile);
  }

  // ─── DYNAMIC RESOURCE GENERATOR (GROQ) ────────────────────────────────
  async generateResourcesGroq(skillTag, nodeTitle, nodeDescription) {
    console.log(`[Resource Gen] Generating links for ${skillTag} (Groq)...`);
    const prompt = `
      You are an elite internet resource curator. 
      Find the single best free resource in each of these 4 categories for learning:
      Topic: ${nodeTitle || skillTag}
      Description: ${nodeDescription || "Mastering the core concepts"}
      
      1. Official documentation (from: ${TRUSTED_SOURCES.docs.join(", ")})
      2. Video under 25 minutes (from: ${TRUSTED_SOURCES.video.join(", ")})  
      3. Written tutorial (from: ${TRUSTED_SOURCES.read.join(", ")})
      4. Interactive practice (from: ${TRUSTED_SOURCES.practice.join(", ")})

      CRITICAL RULES:
      - Return exactly 4 resources, one of each category (documentation, video, article, interactive).
      - Do NOT hallucinate video IDs or specific URL paths if you are not 100% sure they exist. 
      - If you do not know an exact, valid URL, you MUST return a valid search URL instead (e.g., "https://www.youtube.com/results?search_query=react+hooks+tutorial" or "https://dev.to/search?q=react+hooks").
      - Output ONLY a JSON object containing a "resources" array with exactly 4 objects. No markdown wrapper.
      
      For each resource return this exact schema:
      {
        "title": "String - Specific title of the resource",
        "url": "String - The URL",
        "type": "String - 'documentation' | 'video' | 'article' | 'interactive'",
        "sourceName": "String - e.g. 'Traversy Media' or 'React Docs'",
        "estimatedTime": "String - e.g. '15 mins' or '2 hours'",
        "description": "String - One sentence: what specifically to learn from this for someone doing ${nodeDescription}"
      }
    `;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      let parsed = JSON.parse(this._cleanJson(completion.choices[0].message.content));
      if (parsed.resources) parsed = parsed.resources;
      return resourceSchema.parse(parsed);
    } catch (error) {
      throw error; 
    }
  }

  // ─── DYNAMIC RESOURCE GENERATOR (GEMINI) ────────────────────────────────
  async generateResourcesGemini(skillTag, nodeTitle, nodeDescription) {
    console.log(`[Resource Gen] Generating links for ${skillTag}...`);
    const prompt = `
      You are an elite internet resource curator. 
      Find the single best free resource in each of these 4 categories for learning:
      Topic: ${nodeTitle || skillTag}
      Description: ${nodeDescription || "Mastering the core concepts"}
      
      1. Official documentation (from: ${TRUSTED_SOURCES.docs.join(", ")})
      2. Video under 25 minutes (from: ${TRUSTED_SOURCES.video.join(", ")})  
      3. Written tutorial (from: ${TRUSTED_SOURCES.read.join(", ")})
      4. Interactive practice (from: ${TRUSTED_SOURCES.practice.join(", ")})

      CRITICAL RULES:
      - Return exactly 4 resources, one of each category (documentation, video, article, interactive).
      - Do NOT hallucinate video IDs or specific URL paths if you are not 100% sure they exist. 
      - If you do not know an exact, valid URL, you MUST return a valid search URL instead (e.g., "https://www.youtube.com/results?search_query=react+hooks+tutorial" or "https://dev.to/search?q=react+hooks").
      - Output ONLY a JSON array containing exactly 4 objects. No markdown wrapper.
      
      For each resource return this exact schema:
      {
        "title": "String - Specific title of the resource",
        "url": "String - The URL",
        "type": "String - 'documentation' | 'video' | 'article' | 'interactive'",
        "sourceName": "String - e.g. 'Traversy Media' or 'React Docs'",
        "estimatedTime": "String - e.g. '15 mins' or '2 hours'",
        "description": "String - One sentence: what specifically to learn from this for someone doing ${nodeDescription}"
      }
    `;
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
      const result = await model.generateContent(prompt);
      const rawJson = this._cleanJson(result.response.text());
      const parsed = JSON.parse(rawJson);
      return resourceSchema.parse(parsed);
    } catch (error) {
      throw error; // Throw so the router catches it and fails over or uses fallback
    }
  }

  // ─── DYNAMIC ASSIGNMENT GENERATOR (GROQ) ──────────────────────────────
  async generateAssignmentGroq(nodeTitle, nodeDescription, skillTag) {
    console.log(`[Assignment Gen] Generating assignment for ${skillTag} (Groq)...`);
    const prompt = `
      You are an expert technical instructor.
      Create a highly engaging, hands-on assignment for a student learning:
      Topic: ${nodeTitle}
      Description: ${nodeDescription}
      Skill Tag: ${skillTag}

      CRITICAL RULES:
      1. Output ONLY a valid JSON object matching the exact schema below.
      2. No markdown wrappers around the JSON.
      3. The assignment should take between 30 and 120 minutes.
      4. "acceptedFormat" must be one of: "github", "url", "document".

      Schema:
      {
        "title": "A catchy title",
        "brief": "A detailed 2-3 paragraph explanation of what they need to build and why.",
        "timeEstimateMinutes": number,
        "acceptedFormat": "github" | "url" | "document",
        "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Criterion 3", "Criterion 4"],
        "commonMistakes": ["Mistake 1", "Mistake 2"],
        "exampleOutputUrl": "A realistic example URL (optional, can be empty string)"
      }
    `;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
        temperature: 0.8,
      });
      const parsed = JSON.parse(this._cleanJson(completion.choices[0].message.content));
      
      // Basic validation
      if (!parsed.title || !parsed.brief || !parsed.acceptanceCriteria) {
        throw new Error("AI returned invalid assignment schema");
      }
      return parsed;
    } catch (error) {
      console.error("AI Assignment Gen (Groq) failed:", error.message);
      throw error;
    }
  }

  // ─── DYNAMIC ASSIGNMENT GENERATOR (GEMINI) ──────────────────────────────
  async generateAssignmentGemini(nodeTitle, nodeDescription, skillTag) {
    console.log(`[Assignment Gen] Generating assignment for ${skillTag}...`);
    const prompt = `
      You are an expert technical instructor.
      Create a highly engaging, hands-on assignment for a student learning:
      Topic: ${nodeTitle}
      Description: ${nodeDescription}
      Skill Tag: ${skillTag}

      CRITICAL RULES:
      1. Output ONLY a valid JSON object matching the exact schema below.
      2. No markdown wrappers around the JSON.
      3. The assignment should take between 30 and 120 minutes.
      4. "acceptedFormat" must be one of: "github", "url", "document".

      Schema:
      {
        "title": "A catchy title",
        "brief": "A detailed 2-3 paragraph explanation of what they need to build and why.",
        "timeEstimateMinutes": number,
        "acceptedFormat": "github" | "url" | "document",
        "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Criterion 3", "Criterion 4"],
        "commonMistakes": ["Mistake 1", "Mistake 2"],
        "exampleOutputUrl": "A realistic example URL (optional, can be empty string)"
      }
    `;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const rawJson = this._cleanJson(result.response.text());
      const parsed = JSON.parse(rawJson);
      
      // Basic validation
      if (!parsed.title || !parsed.brief || !parsed.acceptanceCriteria) {
        throw new Error("AI returned invalid assignment schema");
      }
      return parsed;
    } catch (error) {
      console.error("AI Assignment Gen failed:", error.message);
      throw error;
    }
  }

  // ─── ASSIGNMENT EVALUATOR (GROQ) ──────────────────────────────────────
  async evaluateSubmissionGroq(assignment, rawContent, isOriginal) {
    console.log(`[AI Evaluator] Evaluating submission for ${assignment.title} (Groq)`);
    
    if (!isOriginal) {
      console.warn("[AI Evaluator] Submission marked as unoriginal prior to AI review.");
    }

    const prompt = `
      You are an elite Senior Staff Software Engineer and rigorous Code Reviewer.
      Your task is to evaluate a student's submission against strict acceptance criteria.

      ASSIGNMENT: ${assignment.title}
      SKILL FOCUS: ${assignment.skillTag}
      BRIEF: ${assignment.brief}
      
      ACCEPTANCE CRITERIA:
      ${assignment.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

      STUDENT SUBMISSION RAW CONTENT:
      \`\`\`
      ${rawContent}
      \`\`\`

      RULES FOR EVALUATION:
      1. If the submission does not contain relevant code/content to fulfill the brief, score it low (0-40) and fail it.
      2. If it meets all criteria perfectly, score it 90-100.
      3. For each criterion in the acceptance criteria, explicitly determine if it is "met" or "not_met" and provide a 1-2 sentence specific "reason" referencing the student's code.
      4. "skillLevel" must be mapped roughly to score: <70 (none), 70-79 (beginner), 80-89 (intermediate), 90-100 (advanced).
      5. "status" must be "passed" (score >= 70 AND all core criteria met), "failed" (score < 70 OR missing core criteria), or "flagged_for_review" (borderline 60-69, or if the code looks like cheating or is too complex for you to decide).
      ${!isOriginal ? '6. THE SYSTEM DETECTED PLAGIARISM/DUPLICATE. You must cap the score at 0 and fail the submission immediately.' : ''}

      Output ONLY a valid JSON object matching this EXACT schema. No markdown wrappers.
      {
        "score": number (0-100),
        "skillLevel": "none" | "beginner" | "intermediate" | "advanced",
        "status": "passed" | "failed" | "flagged_for_review",
        "criteriaVerdicts": [
          { "criterion": "Exact text of the criterion", "status": "met" | "not_met", "reason": "Specific reason citing code" }
        ],
        "strengths": ["string", "string"],
        "improvements": ["string", "string"]
      }
    `;

    try {
      // Use 70b versatile for deep code reasoning and larger context windows
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        temperature: 0.4,
      });
      const parsed = JSON.parse(this._cleanJson(completion.choices[0].message.content));
      
      // Enforce schema
      return evaluationSchema.parse(parsed);
    } catch (error) {
      console.error("AI Evaluation (Groq) failed:", error.message);
      throw new AppError("Failed to automatically evaluate submission. It has been flagged for manual instructor review.", 500);
    }
  }

  // ─── ASSIGNMENT EVALUATOR (GEMINI) ──────────────────────────────────────
  async evaluateSubmissionGemini(assignment, rawContent, isOriginal) {
    console.log(`[AI Evaluator] Evaluating submission for ${assignment.title}`);
    
    if (!isOriginal) {
      console.warn("[AI Evaluator] Submission marked as unoriginal prior to AI review.");
    }

    const prompt = `
      You are an elite Senior Staff Software Engineer and rigorous Code Reviewer.
      Your task is to evaluate a student's submission against strict acceptance criteria.

      ASSIGNMENT: ${assignment.title}
      SKILL FOCUS: ${assignment.skillTag}
      BRIEF: ${assignment.brief}
      
      ACCEPTANCE CRITERIA:
      ${assignment.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

      STUDENT SUBMISSION RAW CONTENT:
      \`\`\`
      ${rawContent}
      \`\`\`

      RULES FOR EVALUATION:
      1. If the submission does not contain relevant code/content to fulfill the brief, score it low (0-40) and fail it.
      2. If it meets all criteria perfectly, score it 90-100.
      3. For each criterion in the acceptance criteria, explicitly determine if it is "met" or "not_met" and provide a 1-2 sentence specific "reason" referencing the student's code.
      4. "skillLevel" must be mapped roughly to score: <70 (none), 70-79 (beginner), 80-89 (intermediate), 90-100 (advanced).
      5. "status" must be "passed" (score >= 70 AND all core criteria met), "failed" (score < 70 OR missing core criteria), or "flagged_for_review" (borderline 60-69, or if the code looks like cheating or is too complex for you to decide).
      ${!isOriginal ? '6. THE SYSTEM DETECTED PLAGIARISM/DUPLICATE. You must cap the score at 0 and fail the submission immediately.' : ''}

      Output ONLY a valid JSON object matching this EXACT schema. No markdown wrappers.
      {
        "score": number (0-100),
        "skillLevel": "none" | "beginner" | "intermediate" | "advanced",
        "status": "passed" | "failed" | "flagged_for_review",
        "criteriaVerdicts": [
          { "criterion": "Exact text of the criterion", "status": "met" | "not_met", "reason": "Specific reason citing code" }
        ],
        "strengths": ["string", "string"],
        "improvements": ["string", "string"]
      }
    `;

    try {
      // Use pro model for deep code reasoning and larger context windows
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const rawJson = this._cleanJson(result.response.text());
      const parsed = JSON.parse(rawJson);
      
      // Enforce schema
      return evaluationSchema.parse(parsed);
    } catch (error) {
      console.error("AI Evaluation failed:", error.message);
      throw new AppError("Failed to automatically evaluate submission. It has been flagged for manual instructor review.", 500);
    }
  }

  // ─── AI COMPANION CHAT (GEMINI) ─────────────────────────────────────────
  async chatCompanionGemini(history, newMessage, profile) {
    console.log(`[AI Companion] Processing chat message...`);
    
    // Construct system instructions
    const systemInstruction = `
      You are an expert AI tutor and mentor named "Tech Explorer AI".
      You are speaking to a student who wants to reach their dream role: ${profile?.dreamRole || 'Software Engineer'}.
      Their current level is: ${profile?.currentLevel || 'Beginner'}.
      
      Rules:
      1. Be concise, highly technical but easy to understand.
      2. Keep responses short and punchy. Use markdown (bold, code blocks) heavily.
      3. Focus strictly on answering their question or guiding them in their learning journey.
      4. Do not offer platitudes. Provide direct, actionable insights.
      5. Do not use more than 2-3 short paragraphs.
    `;

    // Map history to Gemini's format: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    const contents = [];
    
    if (history && history.length > 0) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction,
        generationConfig: { temperature: 0.7 }
      });
      
      const result = await model.generateContent({ contents });
      return result.response.text();
    } catch (error) {
      console.error("AI Companion Chat (Gemini) failed:", error.message);
      throw error;
    }
  }

  // ─── AI COMPANION CHAT (GROQ) ─────────────────────────────────────────
  async chatCompanionGroq(history, newMessage, profile) {
    console.log(`[AI Companion] Processing chat message via Groq...`);
    
    const systemInstruction = `
      You are an expert AI tutor and mentor named "Tech Explorer AI".
      You are speaking to a student who wants to reach their dream role: ${profile?.dreamRole || 'Software Engineer'}.
      Their current level is: ${profile?.currentLevel || 'Beginner'}.
      
      Rules:
      1. Be concise, highly technical but easy to understand.
      2. Keep responses short and punchy. Use markdown (bold, code blocks) heavily.
      3. Focus strictly on answering their question or guiding them in their learning journey.
      4. Do not offer platitudes. Provide direct, actionable insights.
      5. Do not use more than 2-3 short paragraphs.
    `;

    const messages = [{ role: "system", content: systemInstruction }];
    
    if (history && history.length > 0) {
      history.forEach(msg => {
        messages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }

    messages.push({ role: 'user', content: newMessage });

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024,
      });

      return chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error("AI Companion Chat (Groq) failed:", error.message);
      throw error;
    }
  }
}

export default new AIService();
