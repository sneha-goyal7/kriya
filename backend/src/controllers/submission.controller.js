import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import Assignment from "../models/assignment.js";
import Submission from "../models/submission.js";
import { validateFormat, checkOriginality, performAiReview, createPortfolioEntry } from "../services/verification.service.js";
import rateLimitService from "../services/rateLimit.service.js";

// @route POST /api/submissions/:assignmentId
export const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { format, content, studentNote } = req.body;
  const studentId = req.user._id;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new NotFoundError("Assignment not found");

  if (assignment.acceptedFormat !== format) {
    throw new BadRequestError(`Invalid format. Assignment requires: ${assignment.acceptedFormat}`);
  }

  // --- RATE LIMITING (Daily Quota) ---
  const limitCheck = await rateLimitService.checkUser(studentId, 'ASSIGNMENT_REVIEW', req.user.tier);
  console.log(`[Submission Controller] Limit Check for ${studentId}:`, limitCheck);
  if (!limitCheck.allowed) {
    return res.status(429).json({ success: false, message: limitCheck.message });
  }

  // --- LAYER 1: Format Validation ---
  try {
    await validateFormat(format, content);
  } catch (error) {
    // Save failed format submission
    await Submission.create({
      student: studentId,
      assignment: assignmentId,
      format,
      content,
      status: "format_failed",
      studentNote,
      criteriaVerdicts: [],
      instructorFeedback: error.message
    });
    throw error; // Rethrow to return 400
  }

  // --- RATE LIMITING / COOLDOWN CHECK ---
  // If 3 fails in 24 hours, enforce 48 hour cooldown
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentFails = await Submission.countDocuments({
    student: studentId,
    assignment: assignmentId,
    status: "failed",
    createdAt: { $gte: yesterday }
  });

  if (recentFails >= 3) {
    throw new BadRequestError("You have 3 failed submissions in the last 24 hours. Please review your feedback and wait 48 hours before resubmitting.");
  }

  // --- LAYER 3: Originality ---
  const originality = await checkOriginality(assignmentId, content, format);

  // 1. SAVE SUBMISSION FIRST (Data Safety)
  const submission = await Submission.create({
    student: studentId,
    assignment: assignmentId,
    format,
    content,
    studentNote,
    status: "pending",
    score: 0,
    skillLevel: "none",
  });

  // Increment Rate Limit immediately after successful save
  await rateLimitService.increment(studentId, 'ASSIGNMENT_REVIEW', req.user.tier);

  // 2. --- LAYER 2 & 4: AI Review ---
  const aiVerdict = await performAiReview(assignment, content, format, originality.isOriginal, studentId, req.user.tier);

  // 3. UPDATE SUBMISSION
  submission.status = aiVerdict.status;
  submission.score = aiVerdict.score;
  submission.skillLevel = aiVerdict.skillLevel;
  submission.criteriaVerdicts = aiVerdict.criteriaVerdicts;
  submission.strengths = aiVerdict.strengths;
  submission.improvements = aiVerdict.improvements;
  await submission.save();

  // If passed, create portfolio entry (Async generation)
  if (submission.status === "passed") {
    await createPortfolioEntry(submission, assignment);
  }

  // If failed >= 4 overall, could trigger welfare check to mentor (omitted for brevity)

  sendSuccess(res, { submission, message: `Submission processed. Status: ${submission.status}` }, 201);
});

// @route GET /api/submissions/my-history/:assignmentId
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ 
    student: req.user._id, 
    assignment: req.params.assignmentId 
  }).sort({ createdAt: -1 });
  
  sendSuccess(res, { submissions });
});

// @route GET /api/submissions/instructor-queue
export const getInstructorQueue = asyncHandler(async (req, res) => {
  // Layer 5 flagged submissions
  const queue = await Submission.find({ status: "flagged_for_review" })
    .populate("student", "name email")
    .populate("assignment", "title skillTag")
    .sort({ createdAt: 1 });
  
  sendSuccess(res, { queue });
});

// @route PUT /api/submissions/:id/override
export const overrideAiVerdict = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;
  const submission = await Submission.findById(req.params.id);
  if (!submission) throw new NotFoundError("Submission not found");

  submission.status = status;
  submission.instructorFeedback = feedback;
  submission.instructorOverride = true;
  await submission.save();

  if (status === "passed") {
    const assignment = await Assignment.findById(submission.assignment);
    await createPortfolioEntry(submission, assignment);
  }

  sendSuccess(res, { submission, message: `Verdict manually overridden to ${status}` });
});
