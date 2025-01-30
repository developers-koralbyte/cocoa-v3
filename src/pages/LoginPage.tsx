import React from "react";
import image1 from "../assets/img/login/Cocoa Login .png";
import LoginForm from "../components/LoginPage/LoginForm";
import logo from "../assets/img/login/cocoaLoginLogo.png";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-full flex">
      {/* Left Section with the Image */}
      <div className="hidden lg:flex lg:w-1/2 ">
        <img
          src={image1}
          alt="Welcome Back Illustration"
          className="w-full h-screen object-fit"
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
