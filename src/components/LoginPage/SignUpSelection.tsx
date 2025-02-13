import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/cocoa-logo.png";
import vendorImage from "../../assets/img/login/vendor.png";
import buyerEnhanced from '../../assets/img/login/buyer_enhanced.png'

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
      navigate(`/new-${selectedRole}?role=${selectedRole}`);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-[85vh] w-full">
      {/* Logo Section */}
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="Cocoa Logo" className="h-[80px] w-auto" />
        <h1 className="text-[50px] font-extrabold font-nunito text-buttonBg">
          Create an account
        </h1>
        <p className="font-sourceSans text-[18px]">
          Welcome to COCOA! Sign up and unlock an innovative world of
          procurement services.
        </p>
      </div>

      {/* Selection Cards */}
      <div className="flex gap-10 mt-6">
        <div
          onClick={() => handleSelection("vendor")}
          className={`cursor-pointer transition transform ${
            selectedRole === "vendor" ? "scale-105" : "scale-100"
          }`}
        >
          <img
            src={vendorImage}
            alt="Vendor"
            className="w-[280px] max-h-[250px] object-contain"
          />
        </div>
        <div
          onClick={() => handleSelection("buyer")}
          className={`cursor-pointer transition transform ${
            selectedRole === "buyer" ? "scale-105" : "scale-100"
          }`}
        >
          <img
            src={buyerEnhanced}
            alt="Buyer"
            className="w-[280px] max-h-[250px] object-contain"
          />
        </div>
      </div>

      {/* Navigation Buttons (Aligned in a Single Line) */}
      <div className="w-full max-w-[800px] flex justify-end items-center mt-6 space-x-6">
        <a
          href="/login"
          className="text-[18px] font-sourceSans text-buttonBg underline"
        >
          Back to login
        </a>
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="px-6 py-3 text-lg font-semibold text-white bg-buttonBg rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SignupSelection;
