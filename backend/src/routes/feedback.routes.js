import express from "express";
import { submitFeedback, getFeedbacks } from "../controllers/feedback.controller.js";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";

const router = express.Router();

// Public route to submit feedback (allow optional auth for user attachment)
router.post("/", optionalAuthMiddleware, submitFeedback);

// Admin route to view feedbacks
router.get("/", authMiddleware, requireCapability("admin_only"), getFeedbacks);

export default router;
