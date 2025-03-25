import React, { useState } from 'react'
import cocoaLogo from '../assets/img/cocoa-logo-white.png'
import VendorVerification from './VerificationVendor'
import { auth, db } from '../utils/firebase'
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from 'firebase/auth'
import { useLocation } from 'react-router-dom'
import upload from '../utils/upload'
import { doc, setDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'

type FormData = {
    email: string
    password: string
    firstName: string
    lastName: string
    businessName: string
    countryRegion: string
    industry: string
    categories: string
    services: string
    role: string
}

const NewVendor = () => {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const role = params.get('role') || 'Vendor'

    // Form data state
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        businessName: '',
        countryRegion: '',
        industry: '',
        categories: '',
        services: '',
        role,
    })

    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>('')

    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Submitting form:', formData)

        try {
            // 1) Create user in Firebase Auth
            const userCredentials = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            )
            const user = userCredentials.user

            // 2) Send email verification
            await sendEmailVerification(user)
            console.log('Verification email sent to:', user.email)

            let avatarUrl = ''
            if (avatarFile) {
                avatarUrl = await upload(avatarFile)
            }

            // 4) Store user data in "users" collection
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                email: formData.email,
                role: formData.role.toLowerCase(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                avatar: avatarUrl,
                blocked: [],
                createdAt: new Date(),
            })

            // 4) Store vendor-specific data in "Vendors" collection with doc ID = user.uid
            await setDoc(doc(db, 'Vendors', user.uid), {
                ...formData,
                role: formData.role.toLowerCase(),
                emailVerified: false,
                uid: user.uid,
                avatar: avatarUrl,
                blocked: [],
                createdAt: new Date(),
                categories: formData.categories
                    .split(',')
                    .map((cat) => cat.trim().toLowerCase()),
            })

            console.log(
                "Vendor added successfully in both 'users' and 'Vendors'."
            )
            setIsSubmitted(true)
        } catch (error: any) {
            console.error('Error adding vendor:', error)
            if (error.code === 'auth/email-already-in-use') {
                // You can show a toast or set local state
                toast.error(
                    'A user with this email already exists. Please log in or use a different email.'
                )
            } else {
                toast.error(
                    'An error occurred during sign-up. Please try again or contact support.'
                )
            }
        }
    }

    // Show vendor verification after successful submission
    if (isSubmitted) {
        return <VendorVerification />
    }

    return (
        <div className="h-screen w-screen flex">
            {/* Left Panel */}
            <div className="w-2/5 bg-[#7C77C1] p-8 flex flex-col justify-between">
                <div>
                    <img
                        src={cocoaLogo}
                        alt="COCOA Logo White"
                        className="mb-8 max-w-full h-auto"
                    />
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Welcome to COCOA!
                    </h2>
                    <p className="text-white/90 text-lg mb-2 leading-relaxed">
                        To help you get started, we've put together a quick and
                        easy onboarding process.
                        <br />
                        <br />
                        Let's get you set up and ready to go!
                    </p>
                </div>
                <div>
                    <p className="text-white/80">
                        Follow the instructions to complete your details.
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-3/5 p-8 flex items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-4xl grid grid-cols-2 gap-8"
                >
                    {/* Personal Details */}
                    <div className="col-span-2">
                        <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="col-span-2">
                        <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">
                            Account Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Avatar (Optional) */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-[#7C77C1] mb-1">
                            Profile Picture
                        </label>
                        <div className="mb-2">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="w-16 h-16 object-cover rounded-full"
                                />
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No image selected
                                </p>
                            )}
                        </div>

                        <label className="inline-flex items-center px-3 py-2 bg-[#7C77C1] text-white text-sm font-medium leading-4 rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M9 8l3-3m0 0l3 3m-3-3v12"
                                />
                            </svg>
                            <span>Upload Avatar</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Business Name & Country/Region */}
                    <div className="col-span-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <label
                                    htmlFor="businessName"
                                    className="block text-sm font-medium text-[#7C77C1] relative cursor-pointer"
                                >
                                    Business Name
                                    <span className="absolute left-0 bottom-full mb-1 w-56 p-2 text-xs text-white bg-gray-800 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                                        Enter your registered business name as
                                        per official documents.
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="businessName"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#7C77C1] focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="countryRegion"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    Country/Region
                                </label>
                                <input
                                    type="text"
                                    id="countryRegion"
                                    name="countryRegion"
                                    value={formData.countryRegion}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <label
                                    htmlFor="industry"
                                    className="block text-sm font-medium text-[#7C77C1] relative cursor-pointer"
                                >
                                    Industry
                                    <span className="absolute left-0 bottom-full mb-1 w-56 p-2 text-xs text-white bg-gray-800 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                                        Specify the industry your business
                                        operates in (e.g., Retail, Technology,
                                        Manufacturing).
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="industry"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#7C77C1] focus:outline-none transition"
                                />
                            </div>

                            <div className="relative group">
                                <label
                                    htmlFor="categories"
                                    className="block text-sm font-medium text-[#7C77C1] relative cursor-pointer"
                                >
                                    Categories
                                    <span className="absolute right-0 bottom-full mb-1 w-56 p-2 text-xs text-white bg-gray-800 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                                        Enter product or service categories
                                        relevant to your business (e.g.,
                                        Electronics, Clothing, Food).
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="categories"
                                    name="categories"
                                    value={formData.categories}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#7C77C1] focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <div className="flex flex-row gap-4 items-end">
                            <div className="relative group flex-1">
                                <label
                                    htmlFor="services"
                                    className="block text-sm font-medium text-[#7C77C1] relative cursor-pointer"
                                >
                                    Services
                                    <span className="absolute left-0 bottom-full mb-1 w-56 p-2 text-xs text-white bg-gray-800 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                                        Enter service relevant to your business
                                        (F&B, Retail, Ecommerce).
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    id="services"
                                    name="services"
                                    value={formData.services}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#7C77C1] focus:outline-none transition"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#7C77C1] text-white rounded-lg hover:bg-[#5F5A9F] transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewVendor
