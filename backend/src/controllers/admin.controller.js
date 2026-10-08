import asyncHandler from "../utils/asyncHandler.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/response.js";
import Employer from "../models/employer.js";
import User from "../models/user.js";
import Course from "../models/course.js"; // Assume we need course data for content review
import Enrollment from "../models/enrollment.js";
import Cohort from "../models/cohort.js";
import Feedback from "../models/feedback.model.js";

// --- HIRING PARTNERS (Employers) ---

export const getHiringPartners = asyncHandler(async (req, res) => {
  // Fetch all employers with their associated user data
  const employers = await Employer.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  sendSuccess(res, { employers });
});

export const togglePartnerVerification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employer = await Employer.findById(id);

  if (!employer) {
    throw new NotFoundError("Hiring partner not found");
  }

  employer.verified = !employer.verified;
  await employer.save();

  sendSuccess(res, { employer, message: `Hiring partner ${employer.verified ? 'verified' : 'unverified'} successfully` });
});

// --- CONTENT REVIEW QUEUE ---

export const getContentQueue = asyncHandler(async (req, res) => {
  // Fetch courses/modules pending review, oldest first
  const pendingContent = await Course.find({ status: "pending" })
    .populate("instructor", "name email")
    .sort({ createdAt: 1 }); // Oldest first for SLA

  sendSuccess(res, { queue: pendingContent });
});

export const approveContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);

  if (!course) {
    throw new NotFoundError("Content not found");
  }

  course.status = "published";
  course.rejectionReason = undefined;
  await course.save();

  sendSuccess(res, { course, message: "Content approved and published successfully" });
});

export const rejectContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const course = await Course.findById(id).populate("instructor", "email");

  if (!course) {
    throw new NotFoundError("Content not found");
  }

  if (!feedback) {
    throw new BadRequestError("Feedback is required for rejection");
  }

  course.status = "rejected";
  course.rejectionReason = feedback;
  await course.save();

  // In a real app, send email to course.instructor.email
  console.log(`Sending rejection email to ${course.instructor?.email} with feedback: ${feedback}`);

  sendSuccess(res, { course, message: "Content rejected and feedback sent" });
});

// --- DASHBOARD OVERVIEW ---

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const activeStudents = await User.countDocuments({ primaryType: "user" });
  const activeInstructors = await User.countDocuments({ "capabilities.canTeach": true });
  const pendingReviewCount = await Course.countDocuments({ status: "pending" });
  const totalPartners = await Employer.countDocuments();
  const publishedCourses = await Course.countDocuments({ status: "published" });

  const metrics = {
    activeStudents,
    activeInstructors,
    pendingReviewCount,
    totalPartners,
    publishedCourses
  };

  sendSuccess(res, { metrics });
});

// --- INSTRUCTOR MANAGEMENT ---

export const getInstructors = asyncHandler(async (req, res) => {
  // Fetch all instructors (users who can teach)
  const users = await User.find({ "capabilities.canTeach": true }).lean();
  
  const instructors = users.map(user => {
    const isSuspended = user.status === "suspended";
    const publishingRevoked = user.publishingRevoked || false;

    return {
      ...user,
      isSuspended,
      publishingRevoked,
    };
  });

  sendSuccess(res, { instructors });
});

export const suspendInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const instructor = await User.findById(id);

  if (!instructor) throw new NotFoundError("Instructor not found");
  
  // Toggle suspension
  instructor.status = instructor.status === "suspended" ? "active" : "suspended";
  await instructor.save();

  sendSuccess(res, { instructor, message: `Instructor account ${instructor.status} successfully` });
});

export const revokePublishing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const instructor = await User.findById(id);

  if (!instructor) throw new NotFoundError("Instructor not found");

  // In Mongoose, if the field doesn't exist in schema, we might need to add it
  // Since we are using a dynamic approach for MVP or strict schema, let's use a flag
  instructor.publishingRevoked = !instructor.publishingRevoked;
  await instructor.save();

  sendSuccess(res, { instructor, message: `Publishing privileges ${instructor.publishingRevoked ? 'revoked' : 'restored'}` });
});

// --- STUDENT MANAGEMENT ---

export const getStudents = asyncHandler(async (req, res) => {
  // Fetch all students (primaryType: user)
  const students = await User.find({ primaryType: "user" }).lean();
  
  sendSuccess(res, { students });
});

// --- COHORTS MANAGEMENT ---

export const getCohorts = asyncHandler(async (req, res) => {
  const cohorts = await Cohort.find()
    .populate("leadInstructors", "name email")
    .sort({ startDate: 1 });

  // Mocking active students for MVP
  const cohortsWithData = cohorts.map(c => ({
    ...c.toObject(),
    activeStudents: Math.floor(Math.random() * 50) + 10 
  }));

  sendSuccess(res, { cohorts: cohortsWithData });
});

export const createCohort = asyncHandler(async (req, res) => {
  const { name, track, startDate, endDate, leadInstructors } = req.body;

  if (!name || !track || !startDate || !endDate) {
    throw new BadRequestError("Please provide all required fields");
  }

  const cohort = await Cohort.create({
    name,
    track,
    startDate,
    endDate,
    leadInstructors: leadInstructors || [],
    status: new Date(startDate) > new Date() ? "upcoming" : "active"
  });

  const populatedCohort = await Cohort.findById(cohort._id).populate("leadInstructors", "name email");

  sendSuccess(res, { cohort: populatedCohort }, 201);
});

// --- ANALYTICS ---

export const getAnalytics = asyncHandler(async (req, res) => {
  // In a production app, these would be complex MongoDB aggregation pipelines
  // counting records across User, Progress, Course, and Enrollment collections.
  
  // Mocking the funnel and queue metrics for the MVP
  const funnel = {
    newSignups: 4520,
    finishedOnboarding: 3810,
    enrolledInCohort: 3105,
    completedFirstModule: 2840,
    jobPlaced: 1450
  };

  const contentQueueWaitTimeHours = 18.5; // If > 24, flag for hiring more reviewers
  
  const analytics = {
    funnel,
    contentQueueWaitTimeHours,
    activeReviewers: 4
  };

  sendSuccess(res, { analytics });
});

// --- FEEDBACK MANAGEMENT ---

export const getFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();
    
  sendSuccess(res, { feedbacks });
});
