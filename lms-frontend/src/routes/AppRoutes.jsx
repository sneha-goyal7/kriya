import { lazy, Suspense } from "react";

import { Routes, Route, Navigate } from "react-router-dom";

// Layouts

import PublicLayout from "@/layouts/PublicLayout";

import DashboardLayout from "@/layouts/DashboardLayout";

// Route Guards

import ProtectedRoute from "@/routes/guards/ProtectedRoute";
import PublicRoute from "@/routes/guards/PublicRoute";
import Settings from "@/pages/shared/Settings";

// Shared

import PageLoader from "@/shared/ui/page-loader";

// PUBLIC PAGES

const Home = lazy(() => import("@/pages/public/Home"));

const Courses = lazy(() => import("@/pages/public/Courses"));

const CourseDetails = lazy(() => import("@/pages/public/CourseDetails"));

const Feedback = lazy(() => import("@/pages/public/Feedback"));
const Terms = lazy(() => import("@/pages/public/Terms"));

// AUTH PAGES

const Login = lazy(() => import("@/pages/auth/Login"));

const Register = lazy(() => import("@/pages/auth/Register"));

const ForgotPassword = lazy(() => import("@/pages/public/ForgotPassword"));

const ResetPassword = lazy(() => import("@/pages/public/ResetPassword"));

const OnboardingWizard = lazy(() => import("@/pages/public/OnboardingWizard"));

// STUDENT PAGES

const StudentDashboard = lazy(() => import("@/pages/student/StudentDashboard"));

const MyCourses = lazy(() => import("@/pages/student/MyCourses"));

const LecturePlayer = lazy(() => import("@/pages/student/LecturePlayer"));

// INSTRUCTOR PAGES

const InstructorDashboard = lazy(
  () => import("@/pages/instructor/InstructorDashboard"),
);

const InstructorCourses = lazy(() => import("@/pages/instructor/InstructorCourses"));

const CreateCourse = lazy(() => import("@/pages/instructor/CreateCourse"));
const CareerPathTree = lazy(() => import("@/pages/student/CareerPathTree"));

const ManageLectures = lazy(() => import("@/pages/instructor/ManageLectures"));
const InstructorReview = lazy(() => import("@/pages/instructor/InstructorReview"));
const StudentAssignment = lazy(() => import("@/pages/student/StudentAssignment"));

import AdminLayout from "@/layouts/AdminLayout";

// EMPLOYER PAGES
const PartnerDashboard = lazy(() => import("@/pages/employer/PartnerDashboard"));
const PartnerOnboarding = lazy(() => import("@/pages/employer/PartnerOnboarding"));

// ADMIN PAGES
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminPartners = lazy(() => import("@/pages/admin/AdminPartners"));
const AdminReview = lazy(() => import("@/pages/admin/AdminReview"));
const AdminInstructors = lazy(() => import("@/pages/admin/AdminInstructors"));
const AdminStudents = lazy(() => import("@/pages/admin/AdminStudents"));
const AdminCohorts = lazy(() => import("@/pages/admin/AdminCohorts"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminFeedback = lazy(() => import("@/pages/admin/AdminFeedback"));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        {/* ================================= */}
        {/* PUBLIC ROUTES */}
        {/* ================================= */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/courses"
          element={
            <PublicLayout>
              <Courses />
            </PublicLayout>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <PublicLayout>
              <CourseDetails />
            </PublicLayout>
          }
        />

        <Route
          path="/feedback"
          element={
            <PublicLayout>
              <Feedback />
            </PublicLayout>
          }
        />

        <Route
          path="/terms"
          element={
            <PublicLayout>
              <Terms />
            </PublicLayout>
          }
        />

        {/* ================================= */}
        {/* AUTH ROUTES */}
        {/* ================================= */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <PublicLayout>
                <Login />
              </PublicLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <PublicLayout>
                <Register />
              </PublicLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <PublicLayout>
                <ForgotPassword />
              </PublicLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <PublicLayout>
                <ResetPassword />
              </PublicLayout>
            </PublicRoute>
          }
        />

        {/* ================================= */}
        {/* ONBOARDING ROUTES */}
        {/* ================================= */}

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* STUDENT ROUTES */}
        {/* ================================= */}

        <Route
          path="/student"
          element={<Navigate to="/student/dashboard" replace />}
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <DashboardLayout>
                <MyCourses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/roadmap"
          element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <DashboardLayout>
                <CareerPathTree />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/assignment/:assignmentId?"
          element={
            <ProtectedRoute allowedRoles={["student", "user", "admin"]}>
              <DashboardLayout>
                <StudentAssignment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/player"
          element={
            <ProtectedRoute allowedRoles={["student", "user"]}>
              <DashboardLayout>
                <LecturePlayer />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["student", "instructor"]}>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* INSTRUCTOR ROUTES */}
        {/* ================================= */}

        <Route
          path="/instructor"
          element={<Navigate to="/instructor/dashboard" replace />}
        />

        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <DashboardLayout>
                <InstructorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <DashboardLayout>
                <InstructorCourses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/create-course"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <DashboardLayout>
                <CreateCourse />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/course/:courseId/lectures"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <DashboardLayout>
                <ManageLectures />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/review-queue"
          element={
            <ProtectedRoute allowedRoles={["instructor", "admin"]}>
              <DashboardLayout>
                <InstructorReview />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* EMPLOYER ROUTES */}
        {/* ================================= */}

        <Route
          path="/employer"
          element={<Navigate to="/employer/dashboard" replace />}
        />

        <Route
          path="/employer/onboarding"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <PartnerOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <DashboardLayout>
                <PartnerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* ADMIN ROUTES */}
        {/* ================================= */}

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/review"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminReview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/instructors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminInstructors />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminStudents />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminPartners />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cohorts"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminCohorts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminFeedback />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* FALLBACK */}
        {/* ================================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
