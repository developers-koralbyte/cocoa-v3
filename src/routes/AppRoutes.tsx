import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from  "../pages/Forgot_Password/ForgotPasswordPage";
import NewPasswordPage from "../pages/Forgot_Password/NewPasswordPage";
import VerificationPage from "../pages/Forgot_Password/VerificationPage";
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
      <Route path="/new-password" element={<NewPasswordPage />}/>
      <Route path="/verification" element={<VerificationPage/>}/>
      </Routes>
  );
};

export default AppRoutes;
