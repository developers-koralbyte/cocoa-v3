import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NewBuyer from "../pages/NewBuyer";
import NewVendor from "../pages/NewVendor";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path='/newBuyer' element={<NewBuyer/>} />
      <Route path='/newVendor' element={<NewVendor/>} />
    </Routes>
  );
};

export default AppRoutes;
