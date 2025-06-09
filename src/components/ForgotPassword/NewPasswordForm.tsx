// src/pages/NewPasswordForm.tsx
import React, { useState, useEffect } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

// THESE TWO IMAGES SHOULD BE THE SAME ONES YOU USED FOR YOUR FORGOT-PASSWORD SCREEN
import largeBubbleImg from "../assets/img/forgot-pass-large.png";
import smallBubbleImg from "../assets/img/forgot-pass-small.png";

const NewPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode") || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // If there's no oobCode, send them back to the forgot-password page
  useEffect(() => {
    if (!oobCode) {
      navigate("/forgot-password", { replace: true });
    }
  }, [oobCode, navigate]);

  const validatePassword = (
    password: string,
    confirmPassword: string
  ): string => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(password))
      return "Password must contain at least one special character";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwdError = validatePassword(
      formData.password,
      formData.confirmPassword
    );
    if (pwdError) {
      setError(pwdError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      // Confirm password reset with Firebase using the oobCode from the URL
      await confirmPasswordReset(auth, oobCode, formData.password);

      setSuccessMessage("Your password has been successfully reset.");
      toast.success("Password reset successful!");

      // After a brief pause, redirect to login
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "An error occurred while resetting your password. Please try again."
      );
      toast.error("Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!oobCode) return null;

  return (
    <div className="min-h-screen w-screen flex">
      {/* Left Panel with chat-bubble images */}
      <div className="w-2/5 bg-[#7C77C1] relative overflow-hidden">
        <div className="absolute top-16 left-8 rounded-lg shadow-lg">
          <img
            src={largeBubbleImg}
            alt="Chat bubble"
            className="block rounded-lg"
          />
        </div>
        <div className="absolute bottom-16 right-8 w-32 rounded-lg shadow-lg">
          <img
            src={smallBubbleImg}
            alt="Chat bubble"
            className="block rounded-lg"
          />
        </div>
      </div>

      {/* Right Panel with the form */}
      <div className="w-3/5 p-8 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-md w-full text-center"
        >
          {error && (
            <div
              className="p-4 mb-4 text-red-600 bg-red-50 rounded-md"
              role="alert"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className="p-4 mb-4 text-green-600 bg-green-50 rounded-md"
              role="alert"
            >
              {successMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-left text-[25px] font-bold font-sourceSans text-gray-700"
            >
              Enter your new password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  error && formData.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-left text-[25px] font-bold font-sourceSans text-gray-700"
            >
              Confirm your new password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  error && formData.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-[142px] bg-buttonBg text-white py-2 px-4 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Resetting..." : "Continue"}
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
      </div>
    </div>
  );
};

export default NewPasswordForm;
