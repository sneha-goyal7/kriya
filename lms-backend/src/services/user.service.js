import userRepository from "../repositories/user.repository.js";
import { NotFoundError, ConflictError } from "../utils/AppError.js";

class UserService {
  /**
   * Submit an application to earn the 'canTeach' capability
   */
  async submitTeachingApplication(userId, applicationData) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.capabilities?.canTeach) {
      throw new ConflictError("You already have teaching capabilities");
    }

    if (user.teachingApplication?.status === "pending") {
      throw new ConflictError("You already have a pending application");
    }

    const updatedUser = await userRepository.updateById(userId, {
      teachingApplication: {
        ...applicationData,
        status: "pending",
      },
    });

    return updatedUser.teachingApplication;
  }

  /**
   * Admin approves or rejects a teaching application
   */
  async reviewTeachingApplication(adminId, applicantId, isApproved) {
    const applicant = await userRepository.findById(applicantId);
    
    if (!applicant) {
      throw new NotFoundError("Applicant not found");
    }

    if (applicant.teachingApplication?.status !== "pending") {
      throw new ConflictError("Applicant does not have a pending application");
    }

    const updateData = {
      "teachingApplication.status": isApproved ? "approved" : "rejected",
      "teachingApplication.reviewedBy": adminId,
      "teachingApplication.reviewedAt": new Date(),
    };

    if (isApproved) {
      updateData["capabilities.canTeach"] = true;
    }

    const updatedUser = await userRepository.updateById(applicantId, updateData);

    return {
      status: updatedUser.teachingApplication.status,
      canTeach: updatedUser.capabilities.canTeach,
    };
  }

  /**
   * Update User General Profile
   */
  async updateProfile(userId, profileData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updatedUser = await userRepository.updateById(userId, {
      name: profileData.name || user.name,
      avatar: profileData.avatar !== undefined ? profileData.avatar : user.avatar,
    });

    return {
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    };
  }

  /**
   * Get all pending teaching applications (for admin)
   */
  async getPendingApplications() {
    // This requires a direct mongoose call that we might want to abstract in the repo
    // Let's assume we add this to the repo or use User directly. 
    // We'll use the repository.
    return await userRepository.findPendingApplications();
  }
}

export default new UserService();
