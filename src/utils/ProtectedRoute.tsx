// ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  console.log("[ProtectedRoute] Checking user and role...", { user, allowedRoles });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    console.warn("[ProtectedRoute] No user found => Redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role; // Now this should be defined if your Firestore doc has it
  if (!allowedRoles.includes(userRole)) {
    console.warn(
      `[ProtectedRoute] Role mismatch: user.role = ${userRole}, allowedRoles = [${allowedRoles.join(
        ", "
      )}]. Redirecting...`
    );
    return (
      <Navigate
        to={userRole === "vendor" ? "/vendor-dashboard" : "/buyer-dashboard"}
        replace
      />
    );
  }

  console.log("[ProtectedRoute] Access granted => Rendering child route");
  return <Outlet />;
};

export default ProtectedRoute;
