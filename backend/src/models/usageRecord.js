import mongoose from "mongoose";

const usageRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobType: {
    type: String,
    required: true,
    enum: ["COMPANION_MESSAGE", "INTERVIEW_QUESTION", "ASSIGNMENT_REVIEW", "CAREER_PATH", "RESOURCE_CURATION"],
  },
  dateKey: {
    type: String,
    required: true,
    // Format: YYYY-MM-DD for daily, YYYY-WW for weekly, YYYY-MM for monthly
  },
  count: {
    type: Number,
    default: 1,
  },
  lastCallAt: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

// TTL index to automatically delete records after expiration
usageRecordSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for fast queries
usageRecordSchema.index({ userId: 1, jobType: 1, dateKey: 1 }, { unique: true });

export default mongoose.model("UsageRecord", usageRecordSchema);
