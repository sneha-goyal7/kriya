import mongoose from "mongoose";

const platformQuotaSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ["GEMINI", "GROQ", "OLLAMA", "CLAUDE"],
  },
  dateKey: {
    type: String,
    required: true, // Format: YYYY-MM-DD
  },
  used: {
    type: Number,
    default: 1,
  },
  expireAt: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

// TTL index
platformQuotaSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
// Compound index
platformQuotaSchema.index({ provider: 1, dateKey: 1 }, { unique: true });

export default mongoose.model("PlatformQuota", platformQuotaSchema);
