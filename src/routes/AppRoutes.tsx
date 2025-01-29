import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NewBuyer from "../pages/NewBuyer";
import NewVendor from "../pages/NewVendor";
import ForgotPasswordPage from  "../pages/Forgot_Password/ForgotPasswordPage";
import NewPasswordPage from "../pages/Forgot_Password/NewPasswordPage";
import VerificationPage from "../pages/Forgot_Password/VerificationPage";
import SignupSelection from "../components/LoginPage/SignUpSelection";
import SignupSelectionPage from "../pages/SignUpSelectionPage";
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={<SignupSelectionPage/>} />
      <Route path='/new-buyer' element={<NewBuyer/>} />
      <Route path='/new-vendor' element={<NewVendor/>} />
      <Route path="forgot-password" element={<ForgotPasswordPage/>}/>
      <Route path="/new-password" element={<NewPasswordPage />} />
      <Route path="/verification" element={<VerificationPage />} />
    </Routes>
  );
};

export default AppRoutes;