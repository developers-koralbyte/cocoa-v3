import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/cocoa-logo.png";

import vendorImage from "../../assets/img/login/vendor.png"; // Use correct path
import buyerEnhanced from "../../assets/img/login/buyer_Enhanced.png"; // Use correct path"
const SignupSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"vendor" | "buyer" | null>(
    null
  );

  const handleSelection = (role: "vendor" | "buyer") => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/new-${selectedRole}`);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center text-center ">
        {/* Logo */}
        <img src={logo} alt="Cocoa Logo" className=" h-[120px] w-[220px] " />

        {/* Title & Subtitle */}
        <h1 className="text-[80px] font-extrabold font-nunito text-buttonBg">
          Create an account
        </h1>
        <p className="font-sourceSans text-[22px] ">
          Welcome to COCOA! Sign up and unlock an innovative world <br /> to
          procurement services.
        </p>

        {/* Selection Cards */}
        <div className="flex gap-8">
          {/* Vendor Card */}
          <div
            onClick={() => handleSelection("vendor")}
            className={`cursor-pointer transition transform ${
              selectedRole === "vendor" ? "scale-105" : "scale-100"
            }`}
          >
            <img
              src={vendorImage}
              alt="Vendor"
              className="w-[395px] h-[350px]"
            />
          </div>

          {/* Buyer Card */}
          <div
            onClick={() => handleSelection("buyer")}
            className={`cursor-pointer transition transform ${
              selectedRole === "buyer" ? "scale-105" : "scale-100"
            }`}
          >
            <img
              src={buyerEnhanced}
              alt="Buyer"
              className="mt-[-6px] h-[350px] w-[395px]"
            />
          </div>
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="flex justify-end items-center w-full max-w-[800px] mt-8 mx-auto">
        <a href="/login" className=" pr-5 text-[25px] font-sourceSans text-buttonBg underline text-lg">
          Back to login
        </a>
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="px-8 py-3 text-lg font-semibold text-white bg-buttonBg rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SignupSelection;
