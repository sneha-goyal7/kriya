/**
 * Auth Service
 * ALL business logic for authentication lives here.
 * No HTTP (req/res) — only data in, data out.
 * Calls UserRepository for database operations.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userRepository from "../repositories/user.repository.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/AppError.js";
import { sendEmail } from "../utils/sendEmail.js";

class AuthService {
  /**
   * Helper to generate Access & Refresh tokens
   */
  _generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        id: user._id, 
        primaryType: user.primaryType, 
        capabilities: user.capabilities 
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  async register({ name, email, password, primaryType = "user" }) {
    // Check if user already exists
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Process Roles Safely
    let finalPrimaryType = primaryType;
    let canTeach = false;

    // Security: Prevent anyone from registering as admin directly via the API
    if (finalPrimaryType === "admin") {
      finalPrimaryType = "user";
    }

    if (finalPrimaryType === "instructor") {
      finalPrimaryType = "user";
      canTeach = true;
    }

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      primaryType: finalPrimaryType,
      capabilities: {
        canLearn: true,
        canTeach,
        canMentor: false,
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = this._generateTokens(user);

    // Save refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryType: user.primaryType,
        capabilities: user.capabilities,
      },
    };
  }

  /**
   * Login with email and password
   */
  async login({ email, password }) {
    // Find user (include password for comparison)
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = this._generateTokens(user);

    // Save refresh token, filter out expired ones
    user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    await userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        primaryType: user.primaryType,
        capabilities: user.capabilities,
      },
    };
  }

  /**
   * Refresh Token
   */
  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new UnauthorizedError("Refresh token required");
    }

    try {
      const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      const user = await userRepository.findById(decoded.id, "+refreshTokens");
      if (!user) throw new UnauthorizedError("User not found");

      // Check if token exists in DB (not revoked/used)
      const tokenExists = user.refreshTokens.find(rt => rt.token === oldRefreshToken);
      if (!tokenExists) {
        // Token reuse detected! Revoke all tokens for security
        user.refreshTokens = [];
        await userRepository.save(user);
        throw new UnauthorizedError("Invalid refresh token (reuse detected)");
      }

      // Filter out the old token and expired ones
      user.refreshTokens = user.refreshTokens.filter(
        rt => rt.token !== oldRefreshToken && rt.expiresAt > new Date()
      );

      // Generate new tokens (Rotation)
      const { accessToken, refreshToken } = this._generateTokens(user);

      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await userRepository.save(user);

      return { 
        accessToken, 
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          primaryType: user.primaryType,
          capabilities: user.capabilities,
        }
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  /**
   * Logout (Revoke refresh token)
   */
  async logout(userId, refreshToken) {
    const user = await userRepository.findById(userId, "+refreshTokens");
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
      await userRepository.save(user);
    }
  }

  /**
   * Forgot password — sends reset email
   */
  async forgotPassword(email, origin) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("No account found with this email");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await userRepository.save(user);

    // Build reset URL
    const resetUrl = `${origin || process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password. This link expires in 10 minutes.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Career OS — Password Reset",
        html,
      });
    } catch (error) {
      // Rollback token on email failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await userRepository.save(user);
      throw new Error("Failed to send reset email. Please try again.");
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken, newPassword) {
    // Hash the token to match what's in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await userRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    // Set new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await userRepository.save(user);
  }
}

export default new AuthService();
