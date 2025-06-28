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

  // If not signed in, send admins to /admin-login, others to /login
  if (!user) {
    const redirectTo = allowedRoles.includes("admin") ? "/admin-login" : "/login";
    console.warn(`[ProtectedRoute] No user found => Redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  const userRole = user.role; // e.g. "admin" | "vendor" | "buyer"
  if (!allowedRoles.includes(userRole)) {
    console.warn(
      `[ProtectedRoute] Role mismatch: user.role = ${userRole}, allowedRoles = [${allowedRoles.join(
        ", "
      )}]. Redirecting...`
    );
    // Redirect each role to its dashboard
    if (userRole === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === "vendor") {
      return <Navigate to="/vendor-dashboard" replace />;
    } else {
      // fallback for buyers or any other
      return <Navigate to="/buyer-dashboard" replace />;
    }
  }

  console.log("[ProtectedRoute] Access granted => Rendering child route");
  return <Outlet />;
};

export default ProtectedRoute;
