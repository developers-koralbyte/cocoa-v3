import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cocoaLogo from "../assets/img/cocoa-logo-white.png";
import VendorVerification from "./VerificationVendor";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import upload from "../utils/upload";
import { toast } from "react-toastify";
import { Upload, FileText, X } from "lucide-react";

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  companyAddress: string;
  countryRegion: string;
  industry: string;
  categories: string;
  services: string;
  role: string;
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*_\-+=`|()[\]{}:;"'<>,.?\/]).+$/;

const NewVendor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get("role") || "Vendor";

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    businessName: "",
    companyAddress: "",
    countryRegion: "",
    industry: "",
    categories: "",
    services: "",
    role,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Hold pending user + data until email verification
  const [pendingUser, setPendingUser] = useState<import("firebase/auth").User | null>(null);
  const [pendingData, setPendingData] = useState<{ formData: FormData; avatarFile: File } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // enforce password rules
    if (!passwordPattern.test(formData.password)) {
      toast.error(
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    try {
      // 1) create the Auth user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      // 2) send them the verification email
      await sendEmailVerification(user);
      toast.info(`Verification email sent to ${user.email}`);
      // 3) defer all Firestore writes & avatar upload until after they verify
      setPendingUser(user);
      if (avatarFile) {
        setPendingData({ formData, avatarFile });
      } else {
        toast.error("Please upload a profile picture before submitting.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("A user with this email already exists. Please log in or use a different email.");
      } else {
        toast.error("An error occurred during sign-up. Please try again.");
      }
    }
  };

  if (pendingUser && pendingData) {
    return <VendorVerification user={pendingUser} formData={pendingData.formData} avatarFile={pendingData.avatarFile} />;
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
            To help you get started, we've put together a quick and easy onboarding process.
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

          {/* Avatar (Optional) - Responsive */}
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

          {/* Business & Address info - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label 
                htmlFor="businessName" 
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Business Name *
              </label>
              <input 
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
                htmlFor="companyAddress" 
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Company Address *
              </label>
              <input 
                id="companyAddress" 
                name="companyAddress" 
                value={formData.companyAddress} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent" 
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label 
                htmlFor="countryRegion" 
                className="block text-sm font-medium text-[#7C77C1] mb-1"
              >
                Country/Region *
              </label>
              <input 
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
                id="categories" 
                name="categories" 
                value={formData.categories} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent" 
              />
            </div>
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
              <input 
                id="services" 
                name="services" 
                value={formData.services} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded text-sm sm:text-base focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#7C77C1] text-white rounded-lg hover:bg-[#5F5A9F] transition font-medium text-sm sm:text-base"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVendor;