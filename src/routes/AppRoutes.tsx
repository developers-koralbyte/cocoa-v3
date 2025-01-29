import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NewBuyer from "../pages/NewBuyer";
import NewVendor from "../pages/NewVendor";
import ForgotPasswordPage from  "../pages/ForgotPasswordPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path='/new-buyer' element={<NewBuyer/>} />
      <Route path='/new-vendor' element={<NewVendor/>} />
      <Route path="forgot-password" element={<ForgotPasswordPage/>}/>
    </Routes>
  );
};

export default AppRoutes;
