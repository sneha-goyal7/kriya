import courseRepository from "../repositories/course.repository.js";
import Lecture from "../models/lecture.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/AppError.js";

class CourseService {
  async getPublishedCourses() {
    return courseRepository.find({ status: "published" });
  }

  async getCourseById(id) {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError("Course not found");
    return course;
  }

  async getCourseDetails(courseId) {
    const course = await this.getCourseById(courseId);
    
    // Only published courses should be visible to normal users, unless they own it
    // That access control check can be done in the controller, but here we just fetch it
    const lectures = await Lecture.find({ course: courseId }).sort({ order: 1 });
    
    return { course, lectures }; 
  }

  async getInstructorCourses(instructorId) {
    const courses = await courseRepository.find({ instructor: instructorId });
    const Enrollment = (await import("../models/enrollment.js")).default;
    
    // Attach enrollment counts and modules
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
        const modules = await Lecture.find({ course: course._id }).select("_id");
        return { ...course.toObject(), enrollmentCount, modules };
      })
    );
    
    return coursesWithStats;
  }

  async createCourse(courseData, instructorId, thumbnail) {
    return courseRepository.create({
      ...courseData,
      instructor: instructorId,
      thumbnail,
      status: "published", // Auto-publish so it appears immediately
    });
  }

  async updateCourse(courseId, instructorId, updateData) {
    const course = await this.getCourseById(courseId);

    if (course.instructor._id.toString() !== instructorId) {
      throw new ForbiddenError("You can only edit your own courses");
    }

    if (course.status === "pending" || course.status === "published") {
      throw new BadRequestError("Cannot edit a course that is pending or published");
    }

    return courseRepository.updateById(courseId, updateData);
  }

  async deleteCourse(courseId, instructorId) {
    const course = await this.getCourseById(courseId);

    if (course.instructor._id.toString() !== instructorId) {
      throw new ForbiddenError("You can only delete your own courses");
    }

    await courseRepository.deleteById(courseId);
    await Lecture.deleteMany({ course: courseId });
  }

  async submitForApproval(courseId, instructorId, approvalDocs) {
    const course = await this.getCourseById(courseId);

    if (course.instructor._id.toString() !== instructorId) {
      throw new ForbiddenError("You can only submit your own courses");
    }

    if (course.status !== "draft" && course.status !== "rejected") {
      throw new BadRequestError("Course must be in draft or rejected status to submit");
    }

    return courseRepository.updateById(courseId, {
      status: "pending",
      approvalDocs,
      rejectionReason: null, // Clear any previous rejection
    });
  }

  async reviewCourse(courseId, status, rejectionReason) {
    const course = await this.getCourseById(courseId);

    if (course.status !== "pending") {
      throw new BadRequestError("Only pending courses can be reviewed");
    }

    return courseRepository.updateById(courseId, {
      status,
      rejectionReason: status === "rejected" ? rejectionReason : null,
    });
  }
}

export default new CourseService();
