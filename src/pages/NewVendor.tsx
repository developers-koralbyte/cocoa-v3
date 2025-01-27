import React, { useState } from "react";
import cocoaLogo from "../assets/img/cocoa-logo-white.png";
import VendorVerification from "./VerificationVendor";

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  industry: string;
  categories: string;
  services: string;
};

const initialFormData: FormData = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  businessName: "",
  industry: "",
  categories: "",
  services: "",
};

const NewVendor = () => {     
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
  };

if (isSubmitted) {
    return <VendorVerification />;
}

  const steps = [
    { number: 1, title: "Account Details" },
    { number: 2, title: "Personal Details" },
    { number: 3, title: "Industry of Interest" },
    { number: 4, title: "Services of Interest" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="w-[40%] bg-[#7C77C1] p-16 flex flex-col">
        <div className="mb-18">
          <img
            src={cocoaLogo}
            alt="COCOA Logo White"
            className="max-w-full h-auto"
          />
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4 font-nunito">
            Welcome to COCOA!
          </h2>
          <p className="text-white/90 text-lg mb-2 leading-relaxed font-nunito">
            To help you get started, we've put together a quick and easy
            onboarding process.
          </p>
          <p className="text-white/90 text-lg leading-relaxed font-nunito">
            Let's get you set up and ready to go!
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.number} className="flex items-center space-x-6">
              <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center text-lg text-white">
                {s.number}
              </div>
              <span className="text-white text-lg font-medium">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-[60%] p-16">
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-12">
          {/* Account Details Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#7C77C1] font-nunito">
              Account Details
            </h3>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#7C77C1] font-nunito">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
                >
                  1st Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
              >
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Industry of Interest Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#7C77C1] font-nunito">
              Vendor Industry
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
                >
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="categories"
                  className="block text-sm font-medium text-[#7C77C1] mb-2 font-nunito"
                >
                  Categories
                </label>
                <input
                  type="text"
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Services of Interest Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#7C77C1] font-nunito">
              Types of services
            </h3>
            <div>
              <input
                type="text"
                id="services"
                name="services"
                value={formData.services}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C77C1] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#7C77C1] text-white rounded-full hover:bg-[#6661B0] transition-colors font-nunito"
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
