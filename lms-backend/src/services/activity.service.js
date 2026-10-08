import User from "../models/user.js";

export const logActivity = async (userId, action, type = "learning") => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let currentStreak = user.currentStreak || 0;
    let longestStreak = user.longestStreak || 0;

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      
      const diffTime = Math.abs(today - lastActiveDay);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Active yesterday
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Missed a day
        currentStreak = 1;
      }
      // If diffDays === 0, they already logged activity today, so streak stays the same
    } else {
      // First activity ever
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Prepare activity log
    const newActivity = {
      action,
      type,
      timestamp: now
    };

    // Keep only last 20 activities
    const updatedActivities = [newActivity, ...(user.recentActivities || [])].slice(0, 20);

    // Update user
    await User.findByIdAndUpdate(userId, {
      $set: {
        lastActiveDate: now,
        currentStreak,
        longestStreak,
        recentActivities: updatedActivities
      }
    });

  } catch (error) {
    console.error("[ActivityService] Failed to log activity:", error.message);
  }
};
