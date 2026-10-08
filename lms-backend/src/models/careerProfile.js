import mongoose from "mongoose";

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dreamRole: {
      type: String,
      required: true,
    },
    currentLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    verifiedSkills: [
      {
        skillName: String,
        level: { type: String, enum: ["beginner", "intermediate", "advanced"] },
        score: Number,
      }
    ],
    preferredLearningStyle: {
      type: String,
      enum: ["visual", "hands-on", "reading", "mixed"],
      default: "mixed",
    },
    targetTimelineMonths: {
      type: Number,
      default: 6,
    },
    isOnboarded: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CareerProfile", careerProfileSchema);
