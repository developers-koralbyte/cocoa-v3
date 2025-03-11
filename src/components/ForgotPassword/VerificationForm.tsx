// VerificationForm.tsx
import React, { useState, useRef, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { 
  sendPasswordResetEmail, 

  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../";

interface VerificationFormProps {
  email: string;
  actionCode?: string; // From URL if user clicks email link
}

const VerificationForm: React.FC<VerificationFormProps> = ({ email, actionCode }) => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30);
  
  const inputRefs = Array(6).fill(0).map(() => useRef<HTMLInputElement>(null));

  const handleSendVerificationEmail = async () => {
    try {
      setResendDisabled(true);
      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, email);
      toast.success('Verification code sent to your email');
      
      // Start the cooldown timer
      let timeLeft = 30;
      const timerInterval = setInterval(() => {
        timeLeft -= 1;
        setTimer(timeLeft);
        if (timeLeft === 0) {
          setResendDisabled(false);
          clearInterval(timerInterval);
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
      setResendDisabled(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = verificationCode.join("");

    if (code.length !== 6) {
      setError("Please enter the complete verification code");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      // Verify the code with Firebase
      await verifyPasswordResetCode(auth, actionCode || code);
      
      setSuccessMessage("Verification successful!");
      toast.success("Email verified successfully!");
      
      // Navigate to new password page after successful verification
      setTimeout(() => navigate("/new-password", { 
        state: { 
          actionCode: actionCode || code,
          email 
        }
      }), 2000);
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
      toast.error("Invalid verification code");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of your existing code for input handling ...
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);
    setError("");
    setSuccessMessage("");

    if (value !== "" && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto px-8 text-center">
      {error && (
        <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-md" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-4 text-green-600 bg-green-50 rounded-md" role="alert">
          {successMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="verification-code"
          className="block text-left text-[25px] font-bold font-sourceSans text-gray-700"
        >
          Enter Verification Code:
        </label>
        <div className="mt-6 flex justify-between gap-2">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-12 text-center text-xl border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          type="button"
          onClick={handleSendVerificationEmail}
          disabled={resendDisabled}
          className="text-buttonBg hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          {resendDisabled 
            ? `Resend code in ${timer}s` 
            : "Resend verification code"}
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-[142px] bg-buttonBg text-white py-2 px-4 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Verifying..." : "Continue"}
        </button>
      </div>

      <div className="mt-6 text-sourceSans text-[20px] text-center">
        <a
          href="/login"
          className="text-buttonBg hover:underline"
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
        >
          Back to login
        </a>
      </div>
    </form>
  );
};

export default VerificationForm;