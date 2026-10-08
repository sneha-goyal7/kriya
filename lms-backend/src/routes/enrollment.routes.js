import express from "express";

import {
  enrollCourse,
  getUserEnrollments,
  checkEnrollment,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// ENROLL

router.post("/", enrollCourse);

// USER COURSES

router.get("/user/:userId", getUserEnrollments);

// CHECK ENROLLMENT

router.get("/check", checkEnrollment);

export default router;
