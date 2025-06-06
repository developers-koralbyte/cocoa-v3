import React from "react";
import image1 from "../assets/img/login/Cocoa Login .png";
import LoginForm from "../components/LoginPage/LoginForm";
import logo from "../assets/img/login/cocoaLoginLogo.png";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section with the Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Arrow positioned over the image */}
        <ArrowLeft 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white absolute top-4 left-4 sm:top-5 sm:left-5 z-10 cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
          onClick={() => navigate('/')} 
        />

        {/* Background image */}
        <img
          src={image1}
          alt="Welcome Back Illustration"
          className="w-full h-full min-h-screen object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center relative">
        {/* Mobile back arrow - only visible on small screens */}
        <ArrowLeft 
          className="w-6 h-6 text-gray-700 absolute top-4 left-4 z-10 cursor-pointer hover:bg-gray-100 rounded-full p-1 transition-colors duration-200 lg:hidden"
          onClick={() => navigate('/')} 
        />

        <div className="max-w-md w-full px-6 sm:px-8 py-8">
          {/* Logo */}
          <img
            src={logo}
            alt="Cocoa Logo"
            className="mx-auto mb-6 sm:mb-8 h-auto w-auto max-w-[200px] sm:max-w-none"
          />

          {/* Welcome Text */}
          <div className="font-sourceSans text-lg sm:text-xl lg:text-[25px] text-gray-700 mb-8 sm:mb-10 text-center lg:text-left">
            <p className="mb-2">Welcome Back!</p>
            <p>Please log in to your account.</p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;