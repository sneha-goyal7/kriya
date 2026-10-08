import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["frontend", "backend", "fullstack", "devops", "design", "soft-skill", "other"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    popularity: {
      type: Number,
      default: 0,
      index: -1, // High to low
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      }
    ],
  },
  { timestamps: true }
);

// Compound index for quick category filtering ordered by popularity
skillSchema.index({ category: 1, popularity: -1 });

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
