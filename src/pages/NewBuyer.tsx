import React, { useState } from 'react'
import { auth, db } from '../utils/firebase'
import { collection, addDoc, setDoc, doc } from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from 'firebase/auth'
import cocoaLogo from '../assets/img/cocoa-logo-white.png'
import VerificationWaitTime from '../pages/VerificationWaitTime'
import { useLocation } from 'react-router-dom'
import upload from '../utils/upload'
import { toast } from 'react-toastify'
import Select from 'react-select'

interface FormData {
    email: string
    password: string
    firstName: string
    lastName: string
    businessName: string
    countryRegion: string
    industry: string
    categories: string
    services: string[]
    phone: string
    address: string
    role: string // "buyer" or "vendor"
}

const serviceOptions = [
    { value: 'F&B', label: 'F&B' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Ecommerce', label: 'Ecommerce' },
    { value: 'Logistics', label: 'Logistics' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Wholesale', label: 'Wholesale' },
    { value: 'Design', label: 'Design Services' },
    { value: 'printing', label: 'Printing' },
    { value: 'event', label: 'Event Services' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'advertising', label: 'Advertising' },
    { value: 'Packaging', label: 'Packaging' },
    { value: 'Distribution', label: 'Distribution' },
    { value: 'Supply Chain', label: 'Supply Chain' },
    { value: 'Accounting', label: 'Accounting' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Insurance', label: 'Insurance' },
    { value: 'HR', label: 'HR' },
    { value: 'IT', label: 'IT' },
    { value: 'Security', label: 'Security' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Education', label: 'Education' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Other', label: 'Other' },
    
]
const NewBuyer = () => {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const role = params.get('role') || 'Buyer'

    // Basic form data state with new phone and address fields
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        businessName: '',
        countryRegion: '',
        industry: '',
        categories: '',
        services: [] as string[],
        phone: '',
        address: '',
        role,
    })

    // Avatar states (optional)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>('')

    // Submission state
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Handle text input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Handle avatar file selection (with preview)
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleServiceChange = (selectedOptions: any) => {
        setFormData((prev) => ({
            ...prev,
            services: selectedOptions.map(
                (option: { value: string }) => option.value
            ),
        }))
    }
    // Main form submission
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

            // 3) (Optional) Upload avatar
            let avatarUrl = ''
            if (avatarFile) {
                avatarUrl = (await upload(avatarFile)) as string
            }

            // 4) Store user data in "users" collection
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                email: formData.email,
                role: formData.role.toLowerCase(), // "buyer"
                firstName: formData.firstName,
                lastName: formData.lastName,
                avatar: avatarUrl,
                blocked: [],
                createdAt: new Date(),
            })

            // 5) Store buyer data in "Buyers" collection
            const buyerDocRef = doc(db, 'Buyers', user.uid)
            await setDoc(buyerDocRef, {
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

            console.log('Buyer added with ID:', buyerDocRef.id)
            setIsSubmitted(true)
        } catch (error: any) {
            console.error('Error adding buyer:', error)
            if (error.code === 'auth/email-already-in-use') {
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

    // Show verification screen after submission
    if (isSubmitted) {
        return <VerificationWaitTime />
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

                    {/* Contact Details */}
                    <div className="col-span-2">
                        <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">
                            Contact Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="address"
                                    className="block text-sm font-medium text-[#7C77C1]"
                                >
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
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

                    {/* Industry & Categories */}
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

                    {/* Services & Submit */}
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
                                <Select
                                    isMulti
                                    name="services"
                                    options={serviceOptions}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Select or search services"
                                    onChange={handleServiceChange}
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

export default NewBuyer
