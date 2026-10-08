import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

// Config
import corsOptions from "./config/cors.config.js";

// Middleware
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import lectureRoutes from "./routes/lecture.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import careerRoutes from "./routes/career.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";

const app = express();
app.set("trust proxy", true);

// ─── Security Middleware ─────────────────────────────────────────
// Helmet: sets secure HTTP headers (XSS protection, clickjacking, etc.)
app.use(helmet());

// CORS: locked to frontend URL only (no more wildcard)
app.use(cors(corsOptions));

// Cookie parsing
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Rate Limiting ───────────────────────────────────────────────
// General API rate limit
app.use("/api", apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/assignments", assignmentRoutes);

// ─── Health Check ────────────────────────────────────────────────
import mongoose from "mongoose";

app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
  const isGroqAvailable = !!process.env.GROQ_API_KEY;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "ok" : "error",
    database: isDbConnected ? "connected" : "disconnected",
    gemini: isGeminiAvailable ? "reachable" : "missing_key",
    groq: isGroqAvailable ? "reachable" : "missing_key",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "Kriya API is running" });
});

// ─── Global Error Handler (must be last) ─────────────────────────
app.use(errorHandler);

export default app;
