import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import cocoaLogo from "../assets/img/cocoa-logo-white.png";
import VendorVerification from "./VerificationVendor";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import upload from "../utils/upload";
import { toast } from "react-toastify";
import { Upload, FileText, X } from "lucide-react"; // Import Lucide icons

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

type UploadedFile = {
  file: File;
  name: string;
  id: string;
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
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFile[]>([]);

  // Hold pending user + data until email verification
  const [pendingUser, setPendingUser] = useState<import("firebase/auth").User | null>(null);
  const [pendingData, setPendingData] = useState<{ formData: FormData; avatarFile: File | null; documents: UploadedFile[] } | null>(null);

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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => ({
        file,
        name: file.name,
        id: Math.random().toString(36).substring(2, 9)
      }));
      setUploadedDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeDocument = (id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
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
      setPendingData({ formData, avatarFile, documents: uploadedDocuments });
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
    return <VendorVerification user={pendingUser} formData={pendingData.formData} avatarFile={pendingData.avatarFile} documents={pendingData.documents} />;
  }

  return (
    <div className="h-screen w-screen flex">
      {/* Left Panel */}
      <div className="w-2/5 bg-[#7C77C1] p-8 flex flex-col justify-between">
        <div>
          <img src={cocoaLogo} alt="COCOA Logo White" className="mb-8 max-w-full h-auto" />
          <h2 className="text-2xl font-semibold text-white mb-4">Welcome to COCOA!</h2>
          <p className="text-white/90 text-lg mb-2 leading-relaxed">
            To help you get started, we've put together a quick and easy onboarding process.
            <br /><br />
            Let's get you set up and ready to go!
          </p>
        </div>
        <p className="text-white/80">Follow the instructions to complete your details.</p>
      </div>

      {/* Right Panel */}
      <div className="w-3/5 p-8 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl grid grid-cols-2 gap-8">
          {/* Personal Details */}
          <div className="col-span-2">
            <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#7C77C1]">First Name *</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#7C77C1]">Last Name *</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="col-span-2">
            <h3 className="text-2xl font-semibold text-[#7C77C1] mb-4">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#7C77C1]">Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#7C77C1]">Password *</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded" />
              </div>
            </div>
          </div>

          {/* Avatar (Optional) */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-[#7C77C1] mb-1">Profile Picture</label>
            <div className="mb-2 flex items-center gap-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-16 h-16 object-cover rounded-full" />
              ) : (
                <p className="text-sm text-gray-500">No image selected</p>
              )}
              <label className="inline-flex items-center px-3 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Avatar
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
            </div>
          </div>

          {/* Business & Address info */}
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-[#7C77C1]">Business Name *</label>
              <input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-[#7C77C1]">Company Address *</label>
              <input id="companyAddress" name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label htmlFor="countryRegion" className="block text-sm font-medium text-[#7C77C1]">Country/Region *</label>
              <input id="countryRegion" name="countryRegion" value={formData.countryRegion} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Industry & Categories */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-[#7C77C1]">Industry *</label>
              <input id="industry" name="industry" value={formData.industry} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-[#7C77C1]">Categories *</label>
              <input id="categories" name="categories" value={formData.categories} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
          </div>

          {/* Document Upload */}
          <div className="col-span-2">
            <h3 className="text-xl font-semibold text-[#7C77C1] mb-2">Business Documents</h3>
            <p className="text-sm text-gray-500 mb-3">Upload any relevant business documents (licenses, certifications, etc.)</p>
            
            <label className="inline-flex items-center px-4 py-2 bg-[#7C77C1] text-white text-sm font-medium rounded-md cursor-pointer hover:bg-purple-700 mb-4">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
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
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-[#7C77C1] mr-3" />
                      <span className="text-sm text-gray-700">{doc.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services & submit */}
          <div className="col-span-2 flex items-end">
            <div className="flex-1">
              <label htmlFor="services" className="block text-sm font-medium text-[#7C77C1]">Services</label>
              <input id="services" name="services" value={formData.services} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <button type="submit" className="px-6 py-2 bg-[#7C77C1] text-white rounded-lg hover:bg-[#5F5A9F] transition">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVendor;