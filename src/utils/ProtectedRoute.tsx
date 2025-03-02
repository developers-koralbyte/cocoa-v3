import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Retrieve user from localStorage
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  
  console.log("[ProtectedRoute] Checking user and role...", {
    user,
    allowedRoles,
  });

  // If there's no user at all, we redirect to /login
  if (!user) {
    console.warn("[ProtectedRoute] No user found in localStorage => Redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // If the user's role isn't in allowedRoles, we redirect them to their default dashboard
  if (!allowedRoles.includes(user.role)) {
    console.warn(
      `[ProtectedRoute] Role mismatch: user.role = ${user.role}, allowedRoles = [${allowedRoles.join(
        ", "
      )}]. Redirecting to ${user.role === "vendor" ? "/vendor-dashboard" : "/buyer-dashboard"}`
    );
    return <Navigate to={user.role === "vendor" ? "/vendor-dashboard" : "/buyer-dashboard"} replace />;
  }

  // Otherwise, they're allowed in
  console.log("[ProtectedRoute] Access granted => Rendering child route");
  return <Outlet />;
};

export default ProtectedRoute;
