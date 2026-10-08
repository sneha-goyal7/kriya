import mongoose from "mongoose";

const skillAssessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    assessedAt: {
      type: Date,
      default: Date.now,
    },
    evidenceUrl: {
      type: String, // E.g., link to a project or quiz result
    },
  },
  { timestamps: true }
);

export default mongoose.model("SkillAssessment", skillAssessmentSchema);
