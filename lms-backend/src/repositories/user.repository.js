/**
 * User Repository
 * Data access layer — ALL database queries for User model live here.
 * No business logic. No HTTP. Just Mongoose operations.
 */

import User from "../models/user.js";

class UserRepository {
  async findById(id, select = "-password") {
    return User.findById(id).select(select);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");
  }

  async findByResetToken(hashedToken) {
    return User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  async findPendingApplications() {
    return User.find({ "teachingApplication.status": "pending" }).select(
      "name email teachingApplication"
    );
  }

  async save(userDoc) {
    return userDoc.save();
  }
}

export default new UserRepository();
