import asyncHandler from "../utils/asyncHandler.js";
import userService from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";

import cloudinary from "../config/cloudinary.js";

// ─── GENERAL USER PROFILE ──────────────────────────────────────

export const updateUserProfile = asyncHandler(async (req, res) => {
  let avatarUrl = req.validatedBody.avatar;

  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "lms-avatars",
    });
    avatarUrl = result.secure_url;
  }

  const profileData = {
    ...req.validatedBody,
    ...(avatarUrl && { avatar: avatarUrl })
  };

  const result = await userService.updateProfile(req.user.id, profileData);
  sendSuccess(res, {
    message: "Profile updated successfully",
    profile: result,
  });
});

// ─── TEACHING CAPABILITY APPLICATION ─────────────────────────────

export const applyForTeaching = asyncHandler(async (req, res) => {
  const application = await userService.submitTeachingApplication(
    req.user.id,
    req.validatedBody
  );

  sendSuccess(res, {
    message: "Teaching application submitted successfully",
    application,
  });
});

export const getPendingApplications = asyncHandler(async (req, res) => {
  const applications = await userService.getPendingApplications();
  sendSuccess(res, { applications });
});

export const reviewApplication = asyncHandler(async (req, res) => {
  const { applicantId } = req.params;
  const { isApproved } = req.validatedBody; // Assuming a validator checks boolean

  const result = await userService.reviewTeachingApplication(
    req.user.id,
    applicantId,
    isApproved
  );

  sendSuccess(res, {
    message: `Application has been ${result.status}`,
    result,
  });
});
