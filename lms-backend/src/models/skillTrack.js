import mongoose from "mongoose";

const skillTrackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    estimatedMonths: {
      type: Number,
      default: 6,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SkillTrack", skillTrackSchema);
