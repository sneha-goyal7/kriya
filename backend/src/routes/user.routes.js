import express from "express";
import {
  updateUserProfile,
  applyForTeaching,
  getPendingApplications,
  reviewApplication,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  teachingApplicationSchema,
  reviewApplicationSchema,
  updateProfileSchema
} from "../validators/user.validator.js";

import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// PUT /api/users/profile
router.put(
  "/profile",
  upload.single("avatar"),
  validate(updateProfileSchema),
  updateUserProfile
);

// POST /api/users/apply-teaching
router.post(
  "/apply-teaching",
  validate(teachingApplicationSchema),
  applyForTeaching
);

// --- Admin Routes ---
// GET /api/users/teaching-applications
router.get(
  "/teaching-applications",
  requireCapability("admin_only"), // Our middleware says primaryType === "admin" bypasses it, so this effectively locks it to admins (or someone with this fake capability)
  getPendingApplications
);

// POST /api/users/teaching-applications/:applicantId/review
router.post(
  "/teaching-applications/:applicantId/review",
  requireCapability("admin_only"),
  validate(reviewApplicationSchema),
  reviewApplication
);

export default router;
