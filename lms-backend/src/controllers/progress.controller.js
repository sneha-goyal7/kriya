import Progress from "../models/progress.js";

import Lecture from "../models/lecture.js";

// MARK COMPLETE

export const markLectureComplete = async (req, res) => {
  try {
    const { lectureId, userId } = req.body;

    // FIND LECTURE

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    const courseId = lecture.course;

    // FIND PROGRESS

    let progress = await Progress.findOne({
      user: userId,

      course: courseId,
    });

    // CREATE IF NOT EXISTS

    if (!progress) {
      progress = await Progress.create({
        user: userId,

        course: courseId,

        completedLectures: [],

        progressPercentage: 0,
      });
    }

    // ADD LECTURE

    const alreadyCompleted = progress.completedLectures.some(
      (item) => item.toString() === lectureId,
    );

    if (!alreadyCompleted) {
      progress.completedLectures.push(lectureId);
    }

    // TOTAL LECTURES

    const totalLectures = await Lecture.countDocuments({
      course: courseId,
    });

    // CALCULATE %

    progress.progressPercentage = Math.round(
      (progress.completedLectures.length / totalLectures) * 100,
    );

    await progress.save();

    res.status(200).json({
      message: "Progress updated",

      progress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};

// GET COURSE PROGRESS

export const getCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await Progress.findOne({
      user: userId,

      course: courseId,
    });

    if (!progress) {
      return res.status(200).json({
        progressPercentage: 0,

        completedLectures: [],
      });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};
