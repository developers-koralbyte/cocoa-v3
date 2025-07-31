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
import { Upload, FileText, X } from 'lucide-react'

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

interface UploadedFile {
  file: File
  name: string
  id: string
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
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([])
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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({
        file,
        name: file.name,
        id: Math.random().toString(36).substring(2, 9)
      }))
      setUploadedDocuments(prev => [...prev, ...newFiles])
    }
  }

  const removeDocument = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const handleServiceChange = (selected: any) => {
    setFormData(prev => ({
      ...prev,
      services: selected.map((opt: { value: string }) => opt.value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (uploadedDocuments.length === 0) {
      toast.error('Please upload at least one business document before submitting.')
      return
    }

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
        documents={uploadedDocuments}
      />
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col xl:flex-row">
      {/* Left Panel - Responsive */}
      <div className="w-full xl:w-2/5 bg-[#7C77C1] p-4 sm:p-6 md:p-8 flex flex-col justify-between min-h-[300px] xl:min-h-screen">
        <div>
          <img
            src={cocoaLogo}
            alt="COCOA Logo White"
            className="mb-4 sm:mb-6 md:mb-8 max-w-[150px] sm:max-w-[200px] md:max-w-full h-auto"
          />
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-4">
            Welcome to COCOA!
          </h2>
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-2 leading-relaxed">
            To help you get started, we've put together a quick and easy
            onboarding process.
            <br className="hidden sm:block" />
            <br className="hidden sm:block" />
            Let's get you set up and ready to go!
          </p>
        </div>
        <p className="text-white/80 text-xs sm:text-sm md:text-base">
          Follow the instructions to complete your details.
        </p>
      </div>

      {/* Right Panel - Responsive */}
      <div className="w-full xl:w-3/5 p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl space-y-6 sm:space-y-8"
        >
          {/* Personal Details */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#7C77C1] mb-3 sm:mb-4">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#7C77C1] mb-3 sm:mb-4">
              Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#7C77C1] mb-3 sm:mb-4">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Avatar - Responsive */}
          <div>
            <label className="block text-sm font-medium text-[#7C77C1] mb-2">
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm text-gray-500">No image</span>
                </div>
              )}
              <label className="inline-flex items-center px-3 sm:px-4 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Upload Avatar 
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Business & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="countryRegion"
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Country/Region *
              </label>
              <input
                type="text"
                id="countryRegion"
                name="countryRegion"
                value={formData.countryRegion}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
              />
            </div>
          </div>

          {/* Industry & Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Industry *
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="categories"
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Categories *
              </label>
              <input
                type="text"
                id="categories"
                name="categories"
                value={formData.categories}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
              />
            </div>
          </div>

          {/* Document Upload - Responsive */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#7C77C1] mb-2">Business Documents</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">Upload any relevant business documents (licenses, certifications, etc.)</p>
            
            <label className="inline-flex items-center px-3 sm:px-4 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700 mb-4 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Upload Documents *</span>
              <span className="xs:hidden">Upload *</span>
              <input 
                type="file" 
                multiple 
                onChange={handleDocumentUpload} 
                required
                className="hidden" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>

            {uploadedDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded border">
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#7C77C1] mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 truncate">{doc.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0 p-1"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services & Submit - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="services"
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Services *
              </label>
              <Select
                isMulti
                name="services"
                options={serviceOptions}
                className="basic-multi-select text-sm"
                classNamePrefix="select"
                placeholder="Select or search services"
                onChange={handleServiceChange}
                required
                menuPlacement="auto"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: '40px',
                    fontSize: '14px',
                  }),
                  multiValue: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  menu: (provided) => ({
                    ...provided,
                    fontSize: '14px',
                  }),
                }}
              />
            </div>
            <button
              type="submit"
              disabled={uploadedDocuments.length === 0}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base ${
                uploadedDocuments.length > 0
                  ? 'bg-[#7C77C1] text-white hover:bg-[#5F5A9F]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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