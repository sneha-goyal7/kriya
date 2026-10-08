/**
 * Capability Middleware
 * Replaces role-based middleware.
 * Checks if a user has a specific capability (e.g. 'canTeach').
 * Admins implicitly have all capabilities.
 */

import { ForbiddenError, UnauthorizedError } from "../utils/AppError.js";

const requireCapability = (capability) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Admins can do anything
    if (req.user.primaryType === "admin") {
      return next();
    }

    // Employers have implicit teaching capabilities for their challenges,
    // but actual course creation is capability-based.
    
    // Check specific capability
    if (!req.user.capabilities || !req.user.capabilities[capability]) {
      throw new ForbiddenError(`You need "${capability}" access to perform this action`);
    }

    next();
  };
};

export default requireCapability;
