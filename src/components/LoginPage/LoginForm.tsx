import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {  auth, db } from '../../utils/firebase'
// import { doc, getDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

import {
    browserLocalPersistence,
    setPersistence,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import { toast } from 'react-toastify'
import { useUserStore } from '../../utils/userStore'
const LoginForm = () => {
    const { fetchUserInfo } = useUserStore()

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [loading, setLoading] = useState(false)

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) return 'Email is required'
        if (!emailRegex.test(email)) return 'Please enter a valid email address'
        return ''
    }

    const validatePassword = (password: string) => {
        if (!password) return 'Password is required'
        if (password.length < 8) return 'Password must be at least 8 characters'
        return ''
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: '' }))
        setFormError('')
    }

    // const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    //   e.preventDefault();

    //   const emailError = validateEmail(formData.email);
    //   const passwordError = validatePassword(formData.password);

    //   setErrors({
    //     email: emailError,
    //     password: passwordError,
    //   });

    //   if (emailError || passwordError) return;

    //   try {
    //     setIsSubmitting(true);
    //     setFormError("");

    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    //     setTimeout(() => navigate("/"), 1000);
    //     console.log("Form submitted:", formData);
    //   } catch (error) {
    //     setFormError("An error occurred during login. Please try again.");
    //   } finally {
    //     setIsSubmitting(false);
    //   }
    // };

 
const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Set local persistence so user remains logged in
        await setPersistence(auth, browserLocalPersistence);

        // Sign in the user
        const res = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const userId = res.user.uid;

        let userRole = null;

        // Check "Vendors" collection
        const vendorQuery = query(collection(db, "Vendors"), where("uid", "==", userId));
        const vendorSnapshot = await getDocs(vendorQuery);

        if (!vendorSnapshot.empty) {
            userRole = "vendor";
        } else {
            // If not found in Vendors, check "Buyers" collection
            const buyerQuery = query(collection(db, "Buyers"), where("uid", "==", userId));
            const buyerSnapshot = await getDocs(buyerQuery);
            // console.log("buyer", buyerQuery)

            if (!buyerSnapshot.empty) {
                userRole = "buyer";
            }
        }

        if (userRole) {
            localStorage.setItem("user", JSON.stringify({ uid: userId, role: userRole }));
            fetchUserInfo(userId);
            toast.success("Login successful!");

            if (userRole === "vendor") {
                navigate("/vendor-dashboard");
            } else {
                navigate("/buyer-dashboard");
            }
        } else {
            toast.error("User role not found. Please contact support.");
        }
    } catch (err: any) {
        console.error("Login error:", err.message);
        toast.error(`Login failed: ${err.message}`);
    } finally {
        setLoading(false);
    }
};
    
    return (
        <form onSubmit={handleLogin} className="space-y-5 max-w-md " noValidate>
            {formError && (
                <div
                    className="p-4 mb-4 text-red-600 bg-red-50 rounded-md"
                    role="alert"
                >
                    {formError}
                </div>
            )}
            <section>
                <div>
                    <label
                        htmlFor="email"
                        className="text-left block text-[25px] font-bold font-sourceSans text-gray-700"
                    >
                        Email Address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            aria-invalid={!!errors.email}
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                errors.email
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                            placeholder="Enter your email address"
                        />
                        {errors.email && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                id="email-error"
                                role="alert"
                            >
                                {errors.email}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-left pt-5 block text-[25px] font-bold font-sourceSans text-gray-700">
                        Password
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            aria-invalid={!!errors.password}
                            aria-describedby={
                                errors.password ? 'password-error' : undefined
                            }
                            className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                errors.password
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                            }`}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transform flex items-center justify-center"
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                        {errors.password && (
                            <p
                                className="mt-1 text-sm text-red-600"
                                id="password-error"
                                role="alert"
                            >
                                {errors.password}
                            </p>
                        )}
                    </div>
                </div>
                <div className="pt-10 text-right">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-[142px] bg-buttonBg text-white py-2 px-4 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Signing in...' : 'Continue'}
                    </button>
                </div>
                <div className="ml-5 mt-6 text-sourceSans text-[20px]">
                    <a
                        href="/create-account"
                        className="text-buttonBg hover:underline"
                        onClick={() => navigate('/create-account')}
                    >
                        Create an account <span className="pl-3">|</span>
                    </a>
                    <a
                        href="/forgot-password"
                        className="pl-4 text-buttonBg hover:underline"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot password?
                    </a>
                </div>
            </section>
        </form>
    )
}

export default LoginForm
