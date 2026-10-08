import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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

    category: {
      type: String,

      default: "Development",
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    thumbnail: {
      type: String,
    },
    
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
    },

    approvalDocs: {
      type: String,
    },

    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Course = mongoose.model("Course", courseSchema);

courseSchema.index({ isPublished: 1, adminApproved: 1 });

export default Course;
