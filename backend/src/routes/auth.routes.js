/**
 * Auth Routes
 * Every route has Zod validation BEFORE the controller.
 * No raw user input ever reaches the business logic.
 */

import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many attempts from this IP, please try again after 15 minutes",
});

const router = express.Router();

// POST /api/auth/register
router.post("/register", authLimiter, validate(registerSchema), registerUser);

// POST /api/auth/login
router.post("/login", authLimiter, validate(loginSchema), loginUser);

// GET /api/auth/refresh
router.get("/refresh", refreshToken);

// POST /api/auth/logout
router.post("/logout", authMiddleware, logoutUser);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword,
);

// POST /api/auth/reset-password/:resetToken
router.post(
  "/reset-password/:resetToken",
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
