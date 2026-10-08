import Feedback from "../models/feedback.model.js";
import { AppError } from "../utils/AppError.js";

/**
 * @desc    Submit new feedback
 * @route   POST /api/feedback
 * @access  Public (or Private)
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { name, email, message, rating } = req.body;

    const feedbackData = {
      name,
      email,
      message,
      rating,
    };

    // If user is logged in, attach user ID
    if (req.user) {
      feedbackData.user = req.user.id;
    }

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feedback (Admin)
 * @route   GET /api/feedback
 * @access  Private/Admin
 */
export const getFeedbacks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email");

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};
