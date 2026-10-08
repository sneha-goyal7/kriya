import express from "express";
import {
  getHiringPartners,
  togglePartnerVerification,
  getDashboardMetrics,
  getContentQueue,
  approveContent,
  rejectContent,
  getStudents,
  getInstructors,
  suspendInstructor,
  revokePublishing,
  getCohorts,
  createCohort,
  getAnalytics,
  getFeedbacks
} from "../controllers/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import requireCapability from "../middleware/capability.middleware.js";

const router = express.Router();

// All admin routes are protected
router.use(authMiddleware);
router.use(requireCapability("admin_only"));

// Dashboard
router.get("/dashboard/metrics", getDashboardMetrics);

// Analytics
router.get("/analytics", getAnalytics);

// Content Review
router.get("/content-review", getContentQueue);
router.put("/content-review/:id/approve", approveContent);
router.put("/content-review/:id/reject", rejectContent);

// Instructors
router.get("/instructors", getInstructors);
router.put("/instructors/:id/suspend", suspendInstructor);
router.put("/instructors/:id/revoke", revokePublishing);

// Students
router.get("/students", getStudents);

// Cohorts
router.get("/cohorts", getCohorts);
router.post("/cohorts", createCohort);

// Hiring Partners
router.get("/employers", getHiringPartners);
router.put("/employers/:id/verify", togglePartnerVerification);

// Feedbacks
router.get("/feedbacks", getFeedbacks);

export default router;
