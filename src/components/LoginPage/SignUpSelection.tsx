import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/cocoa-logo.png";
import vendorImage from "../../assets/img/login/vendor.png";
import buyerEnhanced from "../../assets/img/login/buyer_enhanced.png";
import googleIcon from "../../assets/icons/googleicon.png"

import { auth, db, googleProvider } from "../../utils/firebase";
import {
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { collection ,setDoc,doc, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

const SignupSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"vendor" | "buyer" | null>(
    null
  );

  // Handle vendor/buyer selection
  const handleSelection = (role: "vendor" | "buyer") => {
    setSelectedRole(role);
  };


  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/new-${selectedRole}?role=${selectedRole}`);
    }
  };

  
  const handleGoogleSignup = async () => {
    if (!selectedRole) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userId = user.uid;
      // Extract first and last name from displayName if available
      const displayName = user.displayName || "";
      const [firstName = "", ...rest] = displayName.split(" ");
      const lastName = rest.join(" ");

      // Check if user doc already exists
      const userRef = query(collection(db, "users"), where("id", "==", userId));
      const snapshot = await getDocs(userRef);

      if (snapshot.empty) {
        // Create minimal user doc in "users" collection
        await setDoc(doc(db, "users", userId), {
          id: userId,
          email: user.email,
          role: selectedRole,
          firstName,
          lastName,
          createdAt: new Date(),
          emailVerified: false,
        });
        
        // Create an empty doc in the respective role collection with doc ID = userId
        if (selectedRole === "buyer") {
          await setDoc(doc(db, "Buyers", userId), {
            uid: userId,
            firstName,
            lastName,
            businessName: "",
            countryRegion: "",
            industry: "",
            categories: "",
            services: "",
            createdAt: new Date(),
          });
        } else if (selectedRole === "vendor") {
          await setDoc(doc(db, "Vendors", userId), {
            uid: userId,
            firstName,
            lastName,
            businessName: "",
            countryRegion: "",
            industry: "",
            categories: "",
            services: "",
            createdAt: new Date(),
          });
        }

        // Optionally send email verification
        await sendEmailVerification(user);
      }

      // Redirect to the respective dashboard
      setTimeout(() => {
        if (selectedRole.toLowerCase() === "vendor") {
          navigate("/vendor-dashboard", { replace: true });
          console.log("Redirecting to vendor dashboard");
        } else {
          navigate("/buyer-dashboard", { replace: true });
          console.log("Redirecting to buyer dashboard");
        }
      }, 2000);
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("A user with this email already exists. Please log in or use a different email.");
      } else {
        toast.error("An error occurred during sign-up. Please try again or contact support.");
      }
    }
  };


  return (
    <div className="flex flex-col items-center justify-center h-[85vh] w-full">
      {/* Logo & Heading */}
      <div className="flex flex-col items-center text-center mb-6">
        <img src={logo} alt="Cocoa Logo" className="h-[80px] w-auto mb-4" />
        <h1 className="text-[50px] font-extrabold font-nunito text-buttonBg">
          Create an account
        </h1>
        <p className="font-sourceSans text-[18px] text-gray-700 max-w-[400px]">
          Welcome to COCOA! Sign up and unlock an innovative world of
          procurement services.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="flex gap-10 mt-2">
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

      {/* Bottom Buttons */}
      <div className="w-full max-w-[800px] flex flex-col md:flex-row items-center justify-end mt-8 space-y-4 md:space-y-0 md:space-x-4">
       
        <div className="flex-1 text-left">
          <a
            href="/login"
            className="text-[18px] font-sourceSans text-buttonBg underline"
          >
            Back to login
          </a>
        </div>

        {/* SIGN UP WITH EMAIL */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`px-6 py-3 text-lg font-semibold rounded-full transition ${
            selectedRole
              ? "bg-buttonBg text-white hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Sign up with Email
        </button>

        <div className="relative flex items-center mx-2">
          <div className="hidden md:block w-px h-6 bg-gray-300"></div> 
         
          <span className="md:hidden mx-2 text-gray-500 font-medium">OR</span>
        </div>

        
        <button
          onClick={handleGoogleSignup}
          disabled={!selectedRole}
          className={`px-6 py-3 text-lg font-semibold rounded-full transition flex items-center justify-center space-x-2 border ${
            selectedRole
              ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
      
          <img
          src={googleIcon}
          alt="Google Icon"
          className="w-7 h-7"
        />

          <span>Sign up with Google</span>
        </button>
      </div>
    </div>
  );
};

export default SignupSelection;
