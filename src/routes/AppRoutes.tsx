import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from  "../pages/ForgotPasswordPage";
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage/>}/>
    </Routes>
  );
};

export default AppRoutes;
