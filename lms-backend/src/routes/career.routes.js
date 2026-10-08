import express from "express";
import {
  getSkillTracks,
  seedSkillTracks,
  getProfile,
  updateProfile,
  getRoadmap,
  generateRoadmap,
  completeNode,
  createSkill,
  getAllSkills,
  createEmployerProfile,
  getEmployerProfile,
  testOutNode
} from "../controllers/career.controller.js";
import { getResourcesBySkillTag } from "../controllers/resource.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema, createSkillSchema, createEmployerSchema } from "../validators/career.validator.js";

const router = express.Router();

// Public/Guest accessible (maybe we want auth for tracks, but let's make it public so users can browse tracks before signing up)
router.get("/tracks", getSkillTracks);

// Protected routes
router.use(authMiddleware);

// Admin only route to seed data
router.post("/tracks/seed", requireCapability("admin_only"), seedSkillTracks);

// Profile
router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);

// Roadmap
router.get("/roadmap", getRoadmap);
router.post("/roadmap/generate", generateRoadmap);
router.put("/roadmap/node/:nodeId/complete", completeNode);
router.post("/roadmap/node/:nodeId/test-out", testOutNode);
import { getAssignmentForNode } from "../controllers/career.controller.js";
router.get("/roadmap/node/:nodeId/assignment", getAssignmentForNode);

// AI Companion
import { sendCompanionMessage } from "../controllers/career.controller.js";
router.post("/chat", sendCompanionMessage);

// Skills
router.get("/skills", getAllSkills);
router.post("/skills", requireCapability("admin_only"), validate(createSkillSchema), createSkill);

// Resources
router.get("/resources", getResourcesBySkillTag);
router.get("/resources/:skillTag", getResourcesBySkillTag);

// Employers
router.get("/employer/profile", getEmployerProfile);
router.post("/employer/profile", validate(createEmployerSchema), createEmployerProfile);

export default router;
