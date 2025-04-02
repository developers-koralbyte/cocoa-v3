import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import cocoaImg from "../assets/img/cocoa-logo.png";
import verificationWait from "../assets/img/Verification/verificationWait.png";
import { doc, getDoc } from "firebase/firestore";

const VerificationWait = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        console.log("After reload, emailVerified:", auth.currentUser.emailVerified);
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          setIsVerified(true);
          // Fetch the Firestore "users" doc to check the role
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("Fetched user doc:", userData);
            const role = userData.role;
            // Redirect based on role
            if (role === "vendor") {
              navigate("/vendor-dashboard", { replace: true });
            } else if (role === "buyer") {
              navigate("/buyer-dashboard", { replace: true });
            } else {
              console.warn("Unknown role, navigating to login");
              navigate("/login", { replace: true });
            }
          } else {
            console.warn("No user document found for uid:", auth.currentUser.uid);
            navigate("/login", { replace: true });
          }
        }
      }
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 mb-6">
        <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
          <img src={cocoaImg} alt="Cocoa Logo" className="w-[180px] h-[90px]" />
        </a>
      </div>
      <div className="mb-8">
        <img src={verificationWait} alt="Verification Wait" className="max-w-[150px] h-auto mb-6" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        Verification in Progress
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-12 font-nunito">
        Thanks for signing up! We're reviewing your account information and email verification.
      </p>
      <button
        className="px-8 py-3 bg-[#7C77C1] text-white rounded-full hover:bg-[#6661B0] transition-colors"
        onClick={() => (window.location.href = "/")}
      >
        Explore Homepage
      </button>
    </div>
  );
};

export default VerificationWait;
