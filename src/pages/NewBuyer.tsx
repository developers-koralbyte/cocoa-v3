import React, { useState } from "react";
import {auth, db } from "../utils/firebase"; // Import Firestore instance
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import cocoaLogo from "../assets/img/cocoa-logo-white.png";
import VerificationSuccess from "./VerificationBuyer";
import VerificationWaitTime from "../pages/VerificationWaitTime";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  countryRegion: string;
  industry: string;
  categories: string;
  services: string;
}

const initialFormData: FormData = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  businessName: "",
  countryRegion: "",
  industry: "",
  categories: "",
  services: "",
};

const NewBuyer = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  console.log("Firestore DB:", db);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", formData); // Debugging
    
    try{
      const userCredentials =await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user=userCredentials.user;
      
      //send email verification
      await sendEmailVerification(user);
      console.log("Verification email sent to email",user.email);

      //store buyer data in firestore database
      const docRef = await addDoc(collection(db,'Buyers'),{
        ...formData,
        emailVerfied :false,   //will be updated after the verification
        uid:user.uid, //store firebase auth uID
      });
      console.log("Buyer added with ID:", docRef.id);
     setIsSubmitted(true);
    }catch (error) {
      console.error("Error adding buyer:", error);
    }
  };
  

  if (isSubmitted) {
    return <VerificationWaitTime />;
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
            To help you get started, we've put together a quick and easy
            onboarding process. <br />
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
                  Email
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
                  Password
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
                  First Name
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
                  Last Name
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

          {/* Business & Country */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-[#7C77C1] mb-1"
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
                  required
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
                  required
                />
              </div>
            </div>
          </div>

          {/* Industry, Categories, Services */}
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
              required
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
              required
            />
          </div>
          <div>
            <label
              htmlFor="categories"
              className="block text-sm font-medium text-[#7C77C1]"
            >
              Services
            </label>
            <input
              type="text"
              id="services"
              name="services"
              value={formData.services}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="col-span-2 flex justify-end">
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
  );
};

export default NewBuyer;
