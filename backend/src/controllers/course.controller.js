import asyncHandler from "../utils/asyncHandler.js";
import courseService from "../services/course.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import cloudinary from "../config/cloudinary.js"; // Can keep here for file upload mapping or move to service. Let's handle upload URL here.
import { ForbiddenError } from "../utils/AppError.js";

// GET /api/courses
export const getCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getPublishedCourses();
  sendSuccess(res, { courses });
});

// GET /api/courses/:id
export const getCourseById = asyncHandler(async (req, res) => {
  const { course, lectures } = await courseService.getCourseDetails(req.params.id);

  // Access Control: If course is not published, only the instructor (or admin) can view it
  if (course.status !== "published") {
    const isOwner = req.user && course.instructor._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.primaryType === "admin";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("This course is not published yet");
    }
  }

  sendSuccess(res, { course, lectures });
});

// GET /api/courses/instructor/:instructorId
export const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getInstructorCourses(req.params.instructorId);
  sendSuccess(res, { courses });
});

// POST /api/courses
export const createCourse = asyncHandler(async (req, res) => {
  let thumbnail = "";

  if (req.file) {
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "lms-thumbnails",
    });
    thumbnail = result.secure_url;
  }

  const course = await courseService.createCourse(req.validatedBody, req.user.id, thumbnail);
  sendCreated(res, { message: "Course created successfully", course });
});

// PUT /api/courses/:courseId
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.courseId, req.user.id, req.validatedBody);
  sendSuccess(res, { message: "Course updated successfully", course });
});

// DELETE /api/courses/:courseId
export const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.courseId, req.user.id);
  sendSuccess(res, { message: "Course deleted successfully" });
});

// PUT /api/courses/:courseId/submit-for-approval
export const submitForApproval = asyncHandler(async (req, res) => {
  const course = await courseService.submitForApproval(
    req.params.courseId, 
    req.user.id, 
    req.validatedBody.approvalDocs
  );
  sendSuccess(res, { message: "Course submitted for approval", course });
});

// POST /api/courses/:courseId/review (Admin)
export const reviewCourse = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.validatedBody;
  const course = await courseService.reviewCourse(req.params.courseId, status, rejectionReason);
  
  sendSuccess(res, { 
    message: `Course has been ${status}`, 
    course 
  });
});
