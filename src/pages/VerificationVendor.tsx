// src/pages/VendorVerification.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPaperclip } from "react-icons/lu";
import cocoaImg from "../assets/img/cocoa-logo.png";
import verificationCheck from "../assets/img/Verification/VerificationCheck.png";
import verificationWait from "../assets/img/Verification/verificationWait.png";
import { auth, db } from "../utils/firebase";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import upload from "../utils/upload";

// Mirror your existing FormData type
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

interface Props {
  user: import("firebase/auth").User;
  formData: FormData;
  avatarFile: File | null;
}

const VendorVerification: React.FC<Props> = ({ user, formData, avatarFile }) => {
  const navigate = useNavigate();
  const userRef = doc(db, "users", user.uid);
  const vendorRef = doc(db, "Vendors", user.uid);

  // phase: "email", "upload", or "verifying"
  const [phase, setPhase] = useState<'email' | 'upload' | 'verifying'>('email');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Poll for email verification
  useEffect(() => {
    if (phase !== 'email') return;
    const intv = setInterval(async () => {
      setCheckingEmail(true);
      await user.reload();
      if (user.emailVerified) {
        clearInterval(intv);
        try {
          // upload avatar
          let avatarUrl = '';
          if (avatarFile) avatarUrl = (await upload(avatarFile)) as string;
          // write users doc
          await setDoc(userRef, {
            id: user.uid,
            email: formData.email,
            role: formData.role.toLowerCase(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            avatar: avatarUrl,
            blocked: [],
            createdAt: new Date(),
            status: 'pending',              // ← mark pending for admin
          });
          // write Vendors doc
          await setDoc(vendorRef, {
            ...formData,
            role: formData.role.toLowerCase(),
            emailVerified: true,
            uid: user.uid,
            avatar: avatarUrl,
            blocked: [],
            createdAt: new Date(),
            categories: formData.categories
              .split(',')
              .map(c => c.trim().toLowerCase()),
              documentUploaded: false,        // ← stays false until admin approves
              status: 'pending',              // ← mark pending
              documents: [],                  // ← initialize empty array
          });
          toast.success('Email verified! Please upload your business proof.');
          setPhase('upload');
        } catch (err) {
          console.error(err);
          toast.error('Failed to finalize account data.');
        }
      }
      setCheckingEmail(false);
    }, 3000);
    return () => clearInterval(intv);
  }, [phase, user, formData, avatarFile, userRef, vendorRef]);

  // drag/drop handlers
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
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sel = e.target.files?.[0];
    if (sel) setFile(sel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      // 1) upload this proof file
      const url = (await upload(file)) as string;

      // 2) append it into a "documents" array—leave documentUploaded: false
      await updateDoc(vendorRef, {
        documents: arrayUnion(url),
      });

      // 3) notify user & redirect immediately
      toast.info('Thank you! Your documents are under review.');
      navigate('/vendor-dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload document. Please try again.');
    }
  };

  // Phase: email verification pending
  if (phase === 'email') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-semibold mb-2">Almost there!</h2>
        <p className="mb-4">
          We’ve sent a verification link to <strong>{user.email}</strong>.
        </p>
        <p className="text-sm text-gray-600">
          {checkingEmail ? 'Checking…' : 'Waiting for you to click the link…'}
        </p>
      </div>
    );
  }

  // Phase: proof upload verifying and redirecting
  if (phase === 'verifying') {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
            <img src={cocoaImg} alt="Cocoa Logo" className="w-[180px] h-[90px]" />
          </a>
        </div>
        <div className="max-w-xl w-full text-center">
          <div className="mb-8 flex justify-center">
            <img src={verificationWait} alt="Verifying" className="max-w-[150px] h-auto mb-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verification in Progress
          </h1>
          <p className="text-gray-600 mb-8 font-nunito">
            We’re verifying your submission. Redirecting shortly...
          </p>
        </div>
      </div>
    );
  }

  // Phase: upload UI
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4">
        <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
          <img src={cocoaImg} alt="Cocoa Logo" className="w-[180px] h-[90px]" />
        </a>
      </div>
      <div className="max-w-xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <img src={verificationCheck} alt="Attach Proof" className="max-w-[150px] h-auto mb-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You are almost there!
        </h1>
        <p className="text-gray-600 mb-8 font-nunito">
          To finish your account verification please attach proof of business
          legitimacy before continuing; we will notify once you are verified!
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging ? 'border-[#7C77C1] bg-[#7C77C1]/5' : 'border-gray-300 hover:border-[#7C77C1]'
            }`}
          >
            <div className="flex flex-col items-center">
              <LuPaperclip className="w-8 h-8 text-[#7C77C1] mb-4" />
              <p className="text-gray-600 mb-2">
                {file ? file.name : 'Drag and drop your documents here'}
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
              file ? 'bg-[#7C77C1] text-white hover:bg-[#6661B0]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
