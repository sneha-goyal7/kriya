import express from "express";

import {
  markLectureComplete,
  getCourseProgress,
} from "../controllers/progress.controller.js";

const router = express.Router();

// MARK COMPLETE

router.post("/", markLectureComplete);

// GET PROGRESS

router.get("/:userId/:courseId", getCourseProgress);

export default router;
