import Lecture from "../models/lecture.js";

// Get Lectures

export const getLectures = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await Lecture.find({
      course: courseId,
    });

    res.status(200).json({
      lectures,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch lectures",
    });
  }
};

// Create Lecture

export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params;

    const { title, videoUrl, notes } = req.body;

    // Validation

    if (!title || !videoUrl) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Calculate order
    const existingLecturesCount = await Lecture.countDocuments({ course: courseId });
    const order = existingLecturesCount + 1;

    // Create
    const lecture = await Lecture.create({
      title,
      videoUrl,
      notes,
      course: courseId,
      order,
    });

    res.status(201).json({
      message: "Lecture created successfully",

      lecture,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};

// Delete Lecture

export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findByIdAndDelete(lectureId);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    res.status(200).json({
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete lecture",
    });
  }
};
