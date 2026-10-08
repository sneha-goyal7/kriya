import express from "express";

import {
  getLectures,
  createLecture,
  deleteLecture,
} from "../controllers/lecture.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import requireCapability from "../middleware/capability.middleware.js";

const router = express.Router();

// Get Lectures

router.get("/:courseId", getLectures);

// Create Lecture

router.post(
  "/:courseId",
  authMiddleware,
  requireCapability("canTeach"),
  createLecture,
);

// Delete Lecture

router.delete(
  "/:lectureId",
  authMiddleware,
  requireCapability("canTeach"),
  deleteLecture,
);

export default router;
