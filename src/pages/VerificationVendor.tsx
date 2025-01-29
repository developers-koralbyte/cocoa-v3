import React, { useState } from "react";
import { LuPaperclip } from "react-icons/lu";
import cocoaImg from "../assets/img/cocoa-logo.png";
import verificationCheck from "../assets/img/Verification/VerificationCheck.png";
import VerificationWait from "./VerificationWaitTime";

const VendorVerification = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      console.log("File to upload:", file);
      setIsSubmitted(true); // Set submission status to true after submission
    }
  };

  if (isSubmitted) {
    return <VerificationWait />; // Render VerificationWait after submission
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Cocoa logo in the top-left corner */}
      <div className="absolute top-4 left-4">
        <a
          href="https://cocoa-app.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={cocoaImg}
            alt="Cocoa Logo"
            className="w-[180px] h-[90px]"
          />
        </a>
      </div>

      {/* Main content */}
      <div className="max-w-xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <img
            src={verificationCheck}
            alt="Verification Check"
            className="max-w-[150px] h-auto mb-6"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You are almost there!
        </h1>

        <p className="text-gray-600 mb-8 font-nunito">
          To finish your account verification please attach proof of business
          legitimacy before continuing, we will notify once you are verified!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging
                ? "border-[#7C77C1] bg-[#7C77C1]/5"
                : "border-gray-300 hover:border-[#7C77C1]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <LuPaperclip className="w-8 h-8 text-[#7C77C1] mb-4" />
              <p className="text-gray-600 mb-2">
                {file ? file.name : "Drag and drop your documents here"}
              </p>
              <p className="text-sm text-gray-500">or</p>
              <label className="mt-2 cursor-pointer text-[#7C77C1] hover:text-[#6661B0]">
                Browse files
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={`w-32 px-6 py-3 rounded-full transition-colors ${
              file
                ? "bg-[#7C77C1] text-white hover:bg-[#6661B0]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!file}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorVerification;
