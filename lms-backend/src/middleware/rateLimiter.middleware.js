/**
 * Rate Limiter Configuration
 * Different rate limits for different route categories.
 * Protects against brute-force attacks and API abuse.
 */

import rateLimit from "express-rate-limit";

// ─── Auth routes: strict (prevents brute-force login attacks) ────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Temporarily increased for testing
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many attempts. Please try again after 15 minutes.",
    },
  },
});

// ─── General API: moderate ───────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please slow down.",
    },
  },
});

// ─── AI routes: strict (expensive API calls) ────────────────────
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "AI_RATE_LIMIT_EXCEEDED",
      message: "AI request limit reached. Please wait a moment before trying again.",
    },
  },
});
