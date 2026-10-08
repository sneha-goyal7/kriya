import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ["video", "course", "article", "interactive", "documentation"],
    required: true,
  },
  sourceName: { type: String, required: true },
  estimatedTime: { type: String, required: true },
  description: { type: String, required: true },
});

const resourceCacheSchema = new mongoose.Schema(
  {
    skillTag: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resources: [resourceSchema],
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "7d", // Automatically delete documents after 7 days
    },
  },
  { timestamps: true }
);

export default mongoose.model("ResourceCache", resourceCacheSchema);
