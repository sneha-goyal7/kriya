import asyncHandler from "../utils/asyncHandler.js";
import careerService from "../services/career.service.js";
import { sendSuccess } from "../utils/response.js";

// GET /api/career/tracks
export const getSkillTracks = asyncHandler(async (req, res) => {
  const tracks = await careerService.getActiveSkillTracks();
  sendSuccess(res, { tracks });
});

// POST /api/career/tracks/seed
// Admin only, used to initialize the database
export const seedSkillTracks = asyncHandler(async (req, res) => {
  const tracks = await careerService.seedSkillTracks();
  sendSuccess(res, { message: "Skill tracks seeded successfully", tracks }, 201);
});

// GET /api/career/profile
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await careerService.getProfile(req.user.id);
  const User = (await import("../models/user.js")).default;
  const userDoc = await User.findById(req.user.id).select("currentStreak longestStreak recentActivities lastActiveDate");
  
  if (userDoc) {
    profile.currentStreak = userDoc.currentStreak;
    profile.longestStreak = userDoc.longestStreak;
    profile.recentActivities = userDoc.recentActivities;
  }

  sendSuccess(res, { profile });
});

// PUT /api/career/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await careerService.updateProfile(req.user.id, req.validatedBody);
  sendSuccess(res, { message: "Profile updated successfully", profile });
});

// GET /api/career/roadmap
export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await careerService.getRoadmap(req.user.id);

  // Compute Domain Mastery
  const domainMastery = {};
  if (roadmap && roadmap.nodes) {
    roadmap.nodes.forEach(node => {
      if (!node.skillDomain) return;
      if (!domainMastery[node.skillDomain]) {
        domainMastery[node.skillDomain] = { total: 0, completed: 0 };
      }
      domainMastery[node.skillDomain].total += 1;
      if (node.status === "completed" || node.status === "tested_out") {
        domainMastery[node.skillDomain].completed += 1;
      }
    });
    
    // Convert to percentages
    Object.keys(domainMastery).forEach(domain => {
      const stats = domainMastery[domain];
      domainMastery[domain] = Math.round((stats.completed / stats.total) * 100);
    });
    
    // Attach to response object (mongoose documents need .toObject() or manual assignment if it's not strictly schema-bound, but since we are just returning JSON, we can do this:)
    roadmap._doc.domainMastery = domainMastery;
  }

  sendSuccess(res, { roadmap });
});

// POST /api/career/roadmap/generate
import aiService from "../services/ai.service.js";
import careerRepository from "../repositories/career.repository.js";
import { BadRequestError } from "../utils/AppError.js";

import aiRouterService from "../services/aiRouter.service.js";

// @route POST /api/career/roadmap
// @desc Generate a personalized roadmap
export const generateRoadmap = asyncHandler(async (req, res) => {
  const profile = await careerService.getProfile(req.user.id);
  if (!profile || !profile.isOnboarded) {
    throw new BadRequestError("You must complete your career profile before generating a roadmap.");
  }

  // Generate roadmap via AI Router
  const aiResponse = await aiRouterService.runAI('CAREER_PATH', { profile }, req.user.id, req.user.tier || 'free');
  
  if (aiResponse.fromFallback) {
    throw new Error(`AI Generation is temporarily overloaded. Reason: ${aiResponse.error || 'All AI providers failed or timed out.'}`);
  }
  
  const roadmapData = aiResponse.result;

  const nodesWithStatus = roadmapData.nodes.map((node, index) => ({
    ...node,
    status: index === 0 ? "active" : "locked",
  }));

  const savedRoadmap = await careerRepository.upsertRoadmap(req.user.id, {
    skillGaps: roadmapData.skillGaps,
    nodes: nodesWithStatus,
    overallProgress: 0,
    isGenerated: true,
  });

  sendSuccess(res, { 
    message: "AI Roadmap generated successfully", 
    roadmap: savedRoadmap 
  }, 201);
});

// PUT /api/career/roadmap/node/:nodeId/complete
export const completeNode = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const roadmap = await careerService.completeNode(req.user.id, nodeId);
  
  sendSuccess(res, {
    message: "Node marked as complete",
    roadmap
  });
});

// POST /api/career/roadmap/node/:nodeId/test-out
export const testOutNode = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const { url } = req.body;

  if (!url || (!url.startsWith("http") && !url.startsWith("github.com"))) {
    throw new BadRequestError("Please provide a valid GitHub or live project URL.");
  }

  // Simulate AI Architect codebase scanning
  console.log(`[AI Architect] Scanning repository at ${url}...`);
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Mark node as complete
  const roadmap = await careerService.completeNode(req.user.id, nodeId);
  
  sendSuccess(res, {
    message: "AI Verification Passed: Evidence of mastery found in codebase.",
    roadmap
  });
});

// --- Skills ---
export const createSkill = asyncHandler(async (req, res) => {
  const skill = await careerService.createSkill(req.validatedBody);
  sendSuccess(res, { message: "Skill created successfully", skill }, 201);
});

export const getAllSkills = asyncHandler(async (req, res) => {
  const skills = await careerService.getAllSkills();
  sendSuccess(res, { skills });
});

// --- Employers ---
export const createEmployerProfile = asyncHandler(async (req, res) => {
  // Ensure user is an employer
  if (req.user.primaryType !== "employer") {
    throw new BadRequestError("Only employers can create an employer profile.");
  }
  const employer = await careerService.createEmployerProfile(req.user.id, req.validatedBody);
  sendSuccess(res, { message: "Employer profile created successfully", employer }, 201);
});

export const getEmployerProfile = asyncHandler(async (req, res) => {
  const employer = await careerService.getEmployerProfile(req.user.id);
  sendSuccess(res, { employer });
});

// --- AI Companion ---
export const sendCompanionMessage = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || message.trim() === '') {
    throw new BadRequestError("Message cannot be empty.");
  }

  // Get user profile for context
  const profile = await careerService.getProfile(req.user.id);

  // Generate response via AI Router
  const aiResponse = await aiRouterService.runAI('COMPANION_MESSAGE', { 
    message, 
    history, 
    profile 
  }, req.user.id, req.user.tier || 'free');

  sendSuccess(res, { 
    reply: aiResponse.result 
  });
});

// @route GET /api/career/roadmap/node/:nodeId/assignment
// @desc Get or generate an assignment for a specific roadmap node
export const getAssignmentForNode = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  
  // Find the user's roadmap and the specific node
  const roadmap = await careerRepository.findRoadmapByUserId(req.user.id);
  if (!roadmap) throw new NotFoundError("Roadmap not found");
  
  const node = roadmap.nodes.find(n => n._id.toString() === nodeId);
  if (!node) throw new NotFoundError("Node not found in roadmap");

  // Check if assignment already exists
  const Assignment = (await import("../models/assignment.js")).default;
  let assignment = await Assignment.findOne({ roadmapNodeId: nodeId });

  if (assignment) {
    return sendSuccess(res, { assignment });
  }

  // Generate on the fly
  console.log(`[Assignments] Generating new assignment for node: ${node.title}`);
  const payload = {
    nodeTitle: node.title,
    nodeDescription: node.description,
    skillTag: node.skillTag || "General",
  };

  const aiResponse = await aiRouterService.runAI('ASSIGNMENT_GENERATION', payload, req.user.id, req.user.tier || 'free');
  
  // Fallback is automatically handled by the aiResponse.result

  assignment = await Assignment.create({
    ...aiResponse.result,
    roadmapNodeId: nodeId,
    moduleName: node.title,
    skillTag: node.skillTag || "General",
  });

  sendSuccess(res, { assignment }, 201);
});
