// NewPasswordForm.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../utils/firebase";

const NewPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { actionCode, email } = location.state || {};
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validatePassword = (password: string, confirmPassword: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password, formData.confirmPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      // Confirm password reset with Firebase
      await confirmPasswordReset(auth, actionCode, formData.password);

      setSuccessMessage("Your password has been successfully reset.");
      toast.success("Password reset successful!");
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting your password. Please try again.");
      toast.error("Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!actionCode || !email) {
    navigate("/forgot-password");
    return null;
  }

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
              error && formData.password ? "border-red-500" : "border-gray-300"
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
              error && formData.confirmPassword ? "border-red-500" : "border-gray-300"
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
  );
};

export default NewPasswordForm;