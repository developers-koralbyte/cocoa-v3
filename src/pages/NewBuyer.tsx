// src/pages/NewBuyer.tsx
import React, { useState } from 'react'
import { auth } from '../utils/firebase'
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
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../utils/firebase'

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

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*_\-+=`|()[\]{}:;"'<>,.?\/]).+$/

const NewBuyer: React.FC = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const role = params.get('role') || 'Buyer'

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    businessName: '',
    countryRegion: '',
    industry: '',
    categories: '',
    services: [],
    phone: '',
    address: '',
    role,
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [pendingUser, setPendingUser] = useState<import('firebase/auth').User | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleServiceChange = (selected: any) => {
    setFormData(prev => ({
      ...prev,
      services: selected.map((opt: { value: string }) => opt.value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordPattern.test(formData.password)) {
      toast.error(
        'Password must include uppercase, lowercase, number & special character.'
      )
      return
    }

    try {
      const creds = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      const user = creds.user
      await sendEmailVerification(user)
      toast.info(`Verification email sent to ${user.email}`)
      setPendingUser(user)
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email already in use.')
      } else {
        toast.error('Sign-up error.')
      }
    }
  }

  if (pendingUser) {
    return (
      <VerificationWaitTime
        user={pendingUser}
        formData={formData}
        avatarFile={avatarFile}
      />
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="w-full lg:w-2/5 bg-[#7C77C1] p-8 flex flex-col justify-between">
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
            To help you get started, we've put together a quick and easy
            onboarding process.
            <br />
            <br />
            Let's get you set up and ready to go!
          </p>
        </div>
        <p className="text-white/80">
          Follow the instructions to complete your details.
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-3/5 p-8 flex items-center justify-center">
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
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
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
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Avatar */}
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
                <p className="text-sm text-gray-500">No image selected</p>
              )}
            </div>
            <label className="inline-flex items-center px-3 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700">
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

          {/* Business & Country */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-[#7C77C1]"
              >
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
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

          {/* Industry & Categories */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-[#7C77C1]"
              >
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label
                htmlFor="categories"
                className="block text-sm font-medium text-[#7C77C1]"
              >
                Categories
              </label>
              <input
                type="text"
                id="categories"
                name="categories"
                value={formData.categories}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Services & Submit */}
          <div className="col-span-2 flex items-end">
            <div className="flex-1">
              <label
                htmlFor="services"
                className="block text-sm font-medium text-[#7C77C1]"
              >
                Services
              </label>
              <Select
                isMulti
                name="services"
                options={serviceOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select or search services"
                onChange={handleServiceChange}
                menuPlacement="top"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#7C77C1] text-white rounded-lg hover:bg-[#5F5A9F] transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewBuyer
