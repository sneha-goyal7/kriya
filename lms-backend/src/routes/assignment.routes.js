import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";
import { getCourseAssignments, createAssignment } from "../controllers/assignment.controller.js";

const router = express.Router();

router.use(authMiddleware);

// Get assignments for a specific course
router.get("/course/:courseId", getCourseAssignments);

// Create an assignment for a specific course (instructor only)
router.post("/course/:courseId", requireCapability("canTeach"), createAssignment);

export default router;
