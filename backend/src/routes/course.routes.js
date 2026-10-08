import express from "express";

import {
  getCourses,
  getCourseById,
  createCourse,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  submitForApproval,
  reviewCourse,
} from "../controllers/course.controller.js";

import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { 
  createCourseSchema, 
  submitCourseSchema, 
  reviewCourseSchema 
} from "../validators/course.validator.js";

const router = express.Router();

// Get All Published Courses (Public)
router.get("/", getCourses);

// Get Course By ID (includes unpublished if owner/admin) - optional auth
router.get("/:id", optionalAuthMiddleware, getCourseById);

// Get Instructor Courses
router.get(
  "/instructor/:instructorId",
  authMiddleware,
  requireCapability("canTeach"),
  getInstructorCourses,
);

// Create Course
router.post(
  "/", 
  authMiddleware,
  requireCapability("canTeach"), 
  upload.single("thumbnail"), 
  validate(createCourseSchema),
  createCourse
);

// Update Course
router.put(
  "/:courseId", 
  authMiddleware,
  requireCapability("canTeach"), 
  validate(createCourseSchema), 
  updateCourse
);

// Delete Course
router.delete(
  "/:courseId", 
  authMiddleware,
  requireCapability("canTeach"), 
  deleteCourse
);

// Submit for Approval
router.put(
  "/:courseId/submit-for-approval",
  authMiddleware,
  requireCapability("canTeach"),
  validate(submitCourseSchema),
  submitForApproval
);

// Review Course (Admin Only)
router.post(
  "/:courseId/review",
  authMiddleware,
  requireCapability("admin_only"), // primaryType === "admin" bypasses capability check, so this is admin only
  validate(reviewCourseSchema),
  reviewCourse
);

export default router;
