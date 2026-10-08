import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    // WHO you are
    primaryType: {
      type: String,
      enum: ["user", "employer", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    tier: {
      type: String,
      enum: ["free", "builder", "placement"],
      default: "free",
    },
    adminRole: {
      type: String,
      enum: ["super_admin", "content_admin"],
      default: "super_admin", // Default to super_admin for existing admins
    },

    // WHAT you can do (earned progressively)
    capabilities: {
      canLearn: { type: Boolean, default: true },
      canTeach: { type: Boolean, default: false },
      canMentor: { type: Boolean, default: false },
    },

    // Teaching application (when applying for canTeach)
    teachingApplication: {
      linkedIn: String,
      yearsExperience: Number,
      expertise: [String],
      sampleWork: String,
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
    },

    onboardingComplete: {
      type: Boolean,
      default: false,
    },

    // Streak & Activity Tracking
    lastActiveDate: { type: Date },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    recentActivities: [
      {
        action: { type: String, required: true },
        type: { type: String, enum: ["learning", "achievement", "system"], default: "learning" },
        timestamp: { type: Date, default: Date.now },
      }
    ],

    publishingRevoked: {
      type: Boolean,
      default: false,
    },

    // Refresh Tokens (array to support multi-device)
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
