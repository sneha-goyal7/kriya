/**
 * Auth Controller
 * THIN — only handles HTTP (req/res). All logic is in AuthService.
 * Uses asyncHandler so no try/catch needed.
 * Uses sendSuccess/sendCreated for consistent responses.
 */

import asyncHandler from "../utils/asyncHandler.js";
import authService from "../services/auth.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

const setTokenCookie = (res, token, rememberMe = false) => {
  const maxAge = rememberMe 
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000;     // 24 hours

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge,
  });
};

// ─── REGISTER ────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  // req.validatedBody comes from Zod validation middleware
  const { accessToken, refreshToken, user } = await authService.register(req.validatedBody);

  setTokenCookie(res, refreshToken);

  sendCreated(res, {
    message: "User registered successfully",
    token: accessToken,
    refreshToken,
    user,
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { rememberMe, ...loginData } = req.validatedBody;
  const { accessToken, refreshToken, user } = await authService.login(loginData);

  setTokenCookie(res, refreshToken, rememberMe);

  sendSuccess(res, {
    message: "Login successful",
    token: accessToken,
    refreshToken,
    user,
  });
});

// ─── REFRESH TOKEN ───────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const oldToken = req.cookies?.refreshToken || req.headers["x-refresh-token"];
  
  const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(oldToken);

  setTokenCookie(res, newRefreshToken);

  sendSuccess(res, {
    message: "Token refreshed successfully",
    token: accessToken,
    refreshToken: newRefreshToken,
    user,
  });
});

// ─── LOGOUT ──────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.headers["x-refresh-token"];
  
  if (token && req.user) {
    await authService.logout(req.user.id, token);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  sendSuccess(res, {
    message: "Logged out successfully",
  });
});

// ─── FORGOT PASSWORD ─────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(
    req.validatedBody.email,
    req.headers.origin,
  );

  sendSuccess(res, {
    message: "Password reset email sent successfully",
  });
});

// ─── RESET PASSWORD ──────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(
    req.params.resetToken,
    req.validatedBody.password,
  );

  sendSuccess(res, {
    message: "Password updated successfully",
  });
});
