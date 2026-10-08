import { useSelector } from "react-redux";

import { Navigate } from "react-router-dom";

function PublicRoute({ children }) {
  const { user, token } = useSelector((state) => state.auth);

  if (user && token) {
    const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
    const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);

    if (baseRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (baseRole === "employer") {
      return <Navigate to="/employer/dashboard" replace />;
    } else if (isInstructor) {
      return <Navigate to="/instructor/dashboard" replace />;
    } else if (baseRole === "student" || baseRole === "user") {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
}

export default PublicRoute;
