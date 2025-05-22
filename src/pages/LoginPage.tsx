
import React from "react";
import image1 from "../assets/img/login/Cocoa Login .png";
import LoginForm from "../components/LoginPage/LoginForm";
import logo from "../assets/img/login/cocoaLoginLogo.png";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";


const LoginPage: React.FC = () => {

  const navigate = useNavigate();

  
  return (
    <div className="min-h-full flex">
      {/* Left Section with the Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
  {/* Arrow positioned over the image */}
  <ArrowLeft 
  className="w-6 h-6 text-white absolute top-5 left-5 z-10 cursor-pointer"
  onClick={() => navigate('/')} 
  />

  {/* Background image */}
  <img
    src={image1}
    alt="Welcome Back Illustration"
    className="w-full h-screen object-cover"
  />
</div>


      {/* Right Section */}
      <div className="lg:w-1/2 w-full h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-8">
          {/* Logo */}
          <img
            src={logo}
            alt="Cocoa Logo"
            className="mx-auto mb-3 h-auto w-auto"
          />

          {/* Welcome Text */}
          <div className="font-sourceSans text-[25px] text-gray-700 mb-10">
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

