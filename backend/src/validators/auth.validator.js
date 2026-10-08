/**
 * Auth Validators — Zod Schemas
 * Validates all auth-related request bodies.
 * Password rules: min 8 chars, 1 uppercase, 1 number, 1 special char.
 */

import { z } from "zod";

// ─── Reusable field schemas ─────────────────────────────────────

const nameField = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters");

const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .email("Invalid email format")
  .toLowerCase();

const passwordField = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

// ─── Registration Schema ─────────────────────────────────────────

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  primaryType: z
    .enum(["user", "employer", "admin", "instructor"], {
      invalid_type_error: "Type must be 'user', 'employer', 'instructor' or 'admin'",
    })
    .default("user"),
});

// ─── Login Schema ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// ─── Forgot Password Schema ─────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailField,
});

// ─── Reset Password Schema ──────────────────────────────────────

export const resetPasswordSchema = z.object({
  password: passwordField,
});
