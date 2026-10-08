import Enrollment from "../models/enrollment.js";
import User from "../models/user.js";
import Course from "../models/course.js";
import { sendEmail } from "../utils/sendEmail.js";

// ENROLL COURSE

export const enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        message: "UserId and CourseId are required",
      });
    }

    // CHECK EXISTING

    const existing = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already enrolled in this course",
      });
    }

    // CREATE

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
    });

    // Send Enrollment Email
    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);
      if (user && course) {
        const message = `
          <h1>Welcome to ${course.title}!</h1>
          <p>Hi ${user.name},</p>
          <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
          <p>Get ready to elevate your skills to the next level.</p>
          <p>Happy Learning!</p>
        `;
        await sendEmail({
          email: user.email,
          subject: `Enrollment Confirmed: ${course.title}`,
          html: message,
        });
      }
    } catch (emailError) {
      console.log("Error sending enrollment email: ", emailError);
      // We don't want to fail the enrollment if the email fails, just log it.
    }

    res.status(201).json({
      message: "Enrolled successfully",

      enrollment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};

// GET USER ENROLLMENTS

export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await Enrollment.find({
      user: userId,
    }).populate("course");

    const courses = enrollments.map((item) => item.course);

    res.status(200).json({
      courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};

// CHECK ENROLLMENT

export const checkEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.query;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    res.status(200).json({
      enrolled: !!enrollment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",

      error: error.message,
    });
  }
};
