import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["skill", "project", "milestone"],
    required: true,
  },
  status: {
    type: String,
    enum: ["locked", "active", "completed"],
    default: "locked",
  },
  linkedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  estimatedHours: {
    type: Number,
    default: 10,
  },
  skillTag: {
    type: String,
    required: true,
  },
  skillDomain: {
    type: String,
    required: true,
  },
});

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    skillGaps: {
      type: [String],
      default: [],
    },
    nodes: [nodeSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isGenerated: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);
