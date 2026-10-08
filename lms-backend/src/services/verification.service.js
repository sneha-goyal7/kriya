import Submission from "../models/submission.js";
import Assignment from "../models/assignment.js";
import PortfolioEntry from "../models/portfolioEntry.js";
import CareerProfile from "../models/careerProfile.js";
import { BadRequestError } from "../utils/AppError.js";
import fetcherService from "./fetcher.service.js";
import aiRouterService from "./aiRouter.service.js";

// --- LAYER 1: Format Validation ---
export const validateFormat = async (format, content) => {
  if (format === "github") {
    // Basic format check
    if (!content.includes("github.com")) throw new BadRequestError("Invalid GitHub URL.");
    
    // Simulating checking if repo is public and has recent commits
    // In a real system, we'd hit the GitHub API here
    if (content.includes("private")) {
      throw new BadRequestError("Please make your repository public before submitting. We need to verify your work.");
    }
  } else if (format === "url") {
    if (!content.startsWith("http")) throw new BadRequestError("This URL is not accessible. Please check your deployment is live.");
  } else if (format === "document") {
    if (content.split(" ").length < 50) {
      throw new BadRequestError("Written document must be at least 50 words.");
    }
  }
};

// --- LAYER 3: Originality Signal ---
export const checkOriginality = async (assignmentId, content, format) => {
  // Check if exactly same URL was submitted by someone else
  if (format !== "document") {
    const duplicate = await Submission.findOne({ assignment: assignmentId, content, status: { $in: ["passed", "failed"] } });
    if (duplicate) {
      return { isOriginal: false, reason: "Identical submission found from another student." };
    }
  }
  return { isOriginal: true };
};

// --- LAYER 2 & 4: AI Review & Criteria Mapping ---
export const performAiReview = async (assignment, content, format, isOriginal, userId, userTier) => {
  try {
    console.log("[Verification Service] Fetching submission content for AI review...");
    // 1. Fetch the raw context (GitHub files, HTML page, or raw text)
    const rawContent = await fetcherService.fetchSubmissionContent(format, content);

    console.log("[Verification Service] Sending to AI Evaluator...");
    // 2. Feed it to the AI for evaluation
    const aiResponse = await aiRouterService.runAI('ASSIGNMENT_REVIEW', { assignment, rawContent, isOriginal }, userId, userTier);
    
    return aiResponse.result;
  } catch (error) {
    console.error("[Verification Service] performAiReview failed:", error);
    // Fallback to flagged for manual review if AI pipeline fails
    return {
      score: 0,
      skillLevel: "none",
      status: "flagged_for_review",
      criteriaVerdicts: assignment.acceptanceCriteria.map(c => ({
        criterion: c,
        status: "not_met",
        reason: "System was unable to evaluate automatically. Awaiting instructor review."
      })),
      strengths: [],
      improvements: ["Manual instructor review required due to system evaluation error."]
    };
  }
};

export const createPortfolioEntry = async (submission, assignment) => {
  const verifiedCriteria = submission.criteriaVerdicts
    .filter(c => c.status === "met")
    .map(c => c.criterion);

  const entry = await PortfolioEntry.create({
    student: submission.student,
    assignment: assignment._id,
    assignmentTitle: assignment.title,
    description: assignment.brief.substring(0, 150) + "...",
    outputUrl: submission.content,
    score: submission.score,
    skillBadge: submission.skillLevel,
    verifiedCriteria
  });

  // Update Career Profile
  await CareerProfile.findOneAndUpdate(
    { user: submission.student },
    {
      $push: {
        verifiedSkills: {
          skillName: assignment.skillTag,
          level: submission.skillLevel,
          score: submission.score
        }
      }
    }
  );

  return entry;
};
