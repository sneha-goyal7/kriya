import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    format: {
      type: String,
      enum: ["github", "url", "document"],
      required: true,
    },
    content: {
      type: String, // URL or raw text
      required: true,
    },
    studentNote: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "format_failed", "passed", "failed", "flagged_for_review"],
      default: "pending",
      index: true,
    },
    score: {
      type: Number, // 0-100
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "none"],
      default: "none",
    },
    criteriaVerdicts: [
      {
        criterion: String,
        status: { type: String, enum: ["met", "partially_met", "not_met"] },
        reason: String
      }
    ],
    strengths: [String],
    improvements: [String],
    instructorFeedback: {
      type: String,
    },
    instructorOverride: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

submissionSchema.index({ student: 1, status: 1 });

export default mongoose.model("Submission", submissionSchema);
