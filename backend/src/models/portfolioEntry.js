import mongoose from "mongoose";

const portfolioEntrySchema = new mongoose.Schema(
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
    },
    assignmentTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String, // Auto-generated from the brief
      required: true,
    },
    outputUrl: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    skillBadge: {
      type: String, // e.g. "Intermediate"
      required: true,
    },
    verifiedCriteria: [
      {
        type: String, // List of criteria they successfully met
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("PortfolioEntry", portfolioEntrySchema);
