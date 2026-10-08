/**
 * Global Error Handler
 * Catches ALL errors and returns structured JSON responses.
 * Handles: AppError (our custom errors), Mongoose errors, and unexpected errors.
 */

import { AppError, ValidationError } from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  // ─── Default values ──────────────────────────────────────
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Something went wrong";
  let details = null;

  // ─── Our custom AppError ─────────────────────────────────
  if (err instanceof ValidationError) {
    details = err.details;
  }

  // ─── Mongoose: Duplicate key (e.g., email already exists) ─
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `A record with this ${field} already exists`;
  }

  // ─── Mongoose: Validation error ───────────────────────────
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ─── Mongoose: Bad ObjectId ───────────────────────────────
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid resource ID format";
  }

  // ─── JWT errors ───────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Authentication token has expired";
  }

  // ─── Log error in development ─────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${code}] ${message}`, err.stack ? `\n${err.stack}` : "");
  } else if (!(err instanceof AppError)) {
    // In production, only log unexpected (non-operational) errors
    console.error("UNEXPECTED ERROR:", err);
  }

  // ─── Send structured response ─────────────────────────────
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  // Never leak stack traces to client in production
  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
