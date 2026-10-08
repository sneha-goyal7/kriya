import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { useGetProfileQuery } from "@/features/career/careerApi";
import PageLoader from "@/shared/ui/page-loader";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
  
  const userRoles = [];
  if (baseRole === "user") {
    userRoles.push("user", "student");
    if (user?.capabilities?.canTeach) userRoles.push("instructor");
  } else if (baseRole === "instructor") {
    userRoles.push("instructor", "user", "student"); // Instructors are also users
  } else {
    userRoles.push(baseRole);
  }

  // Check Onboarding Status for users/students
  // We only force onboarding for the main 'user' / 'student' role.
  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !user || (!userRoles.includes("user") && !userRoles.includes("student")),
  });

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some(r => userRoles.includes(r))) {
    return <Navigate to="/" replace />;
  }

  if ((userRoles.includes("user") || userRoles.includes("student")) && isLoading) {
    return <PageLoader />;
  }

  if (
    (userRoles.includes("user") || userRoles.includes("student")) && 
    !userRoles.includes("instructor") &&
    data?.data?.profile && 
    !data.data.profile.isOnboarded &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default ProtectedRoute;
