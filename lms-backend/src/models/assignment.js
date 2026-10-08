import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    skillTag: {
      type: String,
      required: true,
    },
    brief: {
      type: String,
      required: true,
    },
    timeEstimateMinutes: {
      type: Number,
      required: true,
    },
    acceptedFormat: {
      type: String,
      enum: ["github", "url", "document"],
      required: true,
    },
    acceptanceCriteria: [
      {
        type: String,
        required: true,
      }
    ],
    commonMistakes: [
      {
        type: String,
      }
    ],
    exampleOutputUrl: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    roadmapNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);
