import express from "express";
import { submitAssignment, getMySubmissions, getInstructorQueue, overrideAiVerdict } from "../controllers/submission.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { submissionSchema } from "../validators/submission.validator.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Student routes
router.post("/:assignmentId", validate(submissionSchema), submitAssignment);
router.get("/my-history/:assignmentId", getMySubmissions);

// Instructor routes
router.get("/queue/instructor", requireCapability("admin_only"), getInstructorQueue);
router.put("/:id/override", requireCapability("admin_only"), overrideAiVerdict);

export default router;
