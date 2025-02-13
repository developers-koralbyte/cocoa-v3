import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={user.role === "vendor" ? "/vendor-dashboard" : "/buyer-dashboard"} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
