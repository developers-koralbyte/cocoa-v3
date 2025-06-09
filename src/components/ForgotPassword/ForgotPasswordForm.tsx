import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { toast } from "react-toastify";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email))
      return "Please enter a valid email address";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      // ← NEW: send a real Firebase reset‐link
      const actionCodeSettings = {
        url: `${window.location.origin}/new-password`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      setSuccessMessage(
        "A password reset link has been sent to your email address."
      );
      toast.success("Reset link sent!");
    } catch (err: any) {
      console.error(err);
      setError(
        "An error occurred while sending the reset link. Please try again."
      );
      toast.error("Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto px-8 text-center"
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
          htmlFor="email"
          className="block text-left text-[25px] font-bold font-sourceSans text-gray-700"
        >
          Email recovery address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your recovery email address"
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
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </div>

      <div className="mt-6 ml-48 text-sourceSans text-[20px]">
        <a
          href="/login"
          className="text-buttonBg hover:underline"
          onClick={() => navigate("/login")}
        >
          Back to login
        </a>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
