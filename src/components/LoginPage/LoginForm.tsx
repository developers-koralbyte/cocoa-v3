import React, { useState,useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../../utils/firebase";
import { deleteUser } from "firebase/auth";
import googleIcon from "../../assets/icons/googleicon.png"

import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useUserStore } from "../../utils/userStore";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const {currentUser} = useUserStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");



  // Log currentUser from the user store for debugging
  useEffect(() => {
    console.log("Current user in store:", currentUser);
  }, [currentUser]);



  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  };

  const getFriendlyErrorMessage = (error: any) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please log in or try a different email.";
      case "auth/invalid-email":
        return "The email address is invalid. Please check it and try again.";
      case "auth/wrong-password":
        return "The password is incorrect. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email. Please sign up first.";
      default:
        return "An unexpected error occurred. Please try again later.";
    }
  };
  

  // 1) Normal email/password login with validation
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Run validation before signing in
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setLoading(true);

    try {
      // Set local persistence so user remains logged in
      await setPersistence(auth, browserLocalPersistence);

      // Sign in the user
      const res = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const userId = res.user.uid;

      // Check the "users" collection for this user
      const userQuery = query(
        collection(db, "users"),
        where("id", "==", userId)
      );
      const userSnapshot = await getDocs(userQuery);

      // If we found a doc for this user
      if (!userSnapshot.empty) {
        const docData = userSnapshot.docs[0].data();
        const userRole = docData.role; // e.g., "vendor" or "buyer"

        // Store user in localStorage (optional)
        localStorage.setItem(
          "user",
          JSON.stringify({ uid: userId, role: userRole })
        );

        // Optionally fetch user info from store
        // fetchUserInfo(userId);
        useUserStore.setState({ currentUser: docData, isLoading: false });

      
        toast.success("Login successful!");

        // Redirect based on role
        if (userRole === "vendor") {
          navigate("/vendor-dashboard");
        } else if (userRole === "buyer") {
          navigate("/buyer-dashboard");
        } else {
          toast.error("Unknown user role. Please contact support.");
        }
      } else {
        toast.error("User role not found in 'users' collection.");
      }
    } catch (err: any) {
      console.error("Login error:", err.message);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 2) Google login (popup)
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Persist the session locally
      await setPersistence(auth, browserLocalPersistence);
  
      // Sign in with Google (popup)
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userId = user.uid;
  
      // Check if there's a doc for this user in Firestore
      const userQuery = query(
        collection(db, "users"),
        where("id", "==", userId)
      );
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        const docData = userSnapshot.docs[0].data();
        const userRole = docData.role;
  
        // Store user info in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({ uid: userId, role: userRole })
        );
  
        useUserStore.setState({ currentUser: docData, isLoading: false });
        toast.success("Login successful!");
  
        // Redirect based on role
        if (userRole === "vendor") {
          navigate("/vendor-dashboard");
        } else if (userRole === "buyer") {
          navigate("/buyer-dashboard");
        } else {
          toast.error("Unknown user role. Please contact support.");
        }
      } else {
        // New user: no Firestore doc found
        toast.error("No existing account found. Please create an account first.");
  
        // Delete the newly created auth user to avoid orphaning an auth record
        await deleteUser(user);
  
        navigate("/create-account");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleLogin} className="space-y-5 max-w-md" noValidate>
      {formError && (
        <div
          className="p-4 mb-4 text-red-600 bg-red-50 rounded-md"
          role="alert"
        >
          {formError}
        </div>
      )}
      <div>
        <label
          htmlFor="email"
          className="text-left block text-[25px] font-bold text-gray-700"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      <div>
        <label className="text-left block text-[25px] font-bold text-gray-700 pt-3">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-500" />
            ) : (
              <Eye className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
      </div>
      <div className="pt-5">
        <button
          type="submit"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-buttonBg text-white py-2 px-4 rounded-full hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex items-center justify-center w-full space-x-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-gray-100"
      >
        <img
          src={googleIcon}
          alt="Google Icon"
          className="w-7 h-7"
        />
        <span>Continue with Google</span>
      </button>
      <div className="flex justify-end gap-5 pt-4">
        <a href="/create-account" className="text-[18px] text-buttonBg ">
          Create an account
        </a>
        <a href="/forgot-password" className="text-[18px] text-buttonBg ">
          Forgot password?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
