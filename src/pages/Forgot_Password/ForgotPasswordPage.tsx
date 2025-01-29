import React from "react";
import background from "../../assets/img/ForgotPassword/Background.png";

import ForgotPasswordForm from "../../components/ForgotPassword/ForgotPasswordForm";
import logo from "../../assets/img/login/cocoaLoginLogo.png";

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-full flex">
      {/* Left Section with the Image */}
      <div className="lg:w-1/2 w-full h-screen bg-purple-100"> {/* Add background color */}
        <div className="w-full h-full relative"> {/* Add wrapper div */}
          <img
            src={background}
            alt="Welcome Back Illustration"
            className="w-full h-full object-cover absolute inset-0"
            loading="eager" 
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/2 h-[898px] flex justify-center ">
        <div className="mt-28 max-w-md w-full px-8 text-center  ">
          {/* Logo */}
          <img
            src={logo}
            alt="Cocoa Logo"
            className="mt-[-10] mx-auto mb-3 h-auto w-auto"
          />
        <div className="font-black font-nunito text-[65px] leading-[1] text-buttonBg mb-10">
            <h1>Forgot <br/>
                Password?</h1>
        </div>
          {/* Welcome Text */}
          <div className="font-sourceSans text-[20px] text-gray-700 mb-7">
            <p className="mb-2">Enter your email recovery address, we will</p>
            <p>send you a link to reset your password</p>
          </div>

          {/* Login Form */}
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
