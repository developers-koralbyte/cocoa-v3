// src/pages/VerificationWaitTime.tsx
import React, { useEffect } from 'react'
import { auth, db } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'
import cocoaImg from '../assets/img/cocoa-logo.png'
import verificationWait from '../assets/img/Verification/verificationWait.png'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../utils/upload'
import { toast } from 'react-toastify'

// Mirror your FormData type
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
  role: string
}

// Newly passed in uploaded files
interface UploadedFile {
  file: File
  name: string
  id: string
}

interface Props {
  user: import('firebase/auth').User
  formData: FormData
  avatarFile: File | null
  documents: UploadedFile[]
}

const VerificationWaitTime: React.FC<Props> = ({
  user,
  formData,
  avatarFile,
  documents,
}) => {
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(async () => {
      await user.reload()
      if (user.emailVerified) {
        clearInterval(interval)
        try {
          // 1) upload avatar if provided
          let avatarUrl = '';
          if (avatarFile) {
            avatarUrl = await upload(avatarFile, {
              folder: 'avatars',
              uid: user.uid,
            });
          }

          // 2) upload all business docs
          const docUrls = await Promise.all(
            (documents ?? []).map(d =>
              upload(d.file, { folder: 'documents', uid: user.uid })
            )
          );

          // 3) write shared users doc
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: formData.email,
            role: formData.role.toLowerCase(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            avatar: avatarUrl,
            blocked: [],
            status: 'pending',            // ← mark pending review
            createdAt: new Date(),
          })

          // 4) write Buyers doc
          await setDoc(doc(db, 'Buyers', user.uid), {
            ...formData,
            uid: user.uid,
            emailVerified: true,
            avatar: avatarUrl,
            blocked: [],
            documents: docUrls,           // ← store uploaded URLs
            documentUploaded: false,      // ← stays false until admin flips
            status: 'pending',            // ← mark pending review
            createdAt: new Date(),
            categories: formData.categories
              .split(',')
              .map((c) => c.trim().toLowerCase()),
          })

          // 5) notify & redirect
          toast.info('Your profile is under review. We’ll notify you once approved.')
          navigate('/buyer-dashboard', { replace: true })
        } catch (err: any) {
          console.error('Error during verification:', err)
          toast.error('An error occurred. Please contact support.')
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, formData, avatarFile, documents, navigate])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4">
        <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
          <img src={cocoaImg} alt="Cocoa Logo" className="w-[180px] h-[90px]" />
        </a>
      </div>
      <div className="max-w-xl w-full text-center">
        <img
          src={verificationWait}
          alt="Verification in progress"
          className="mx-auto mb-6 max-w-[150px] h-auto"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Verification in Progress
        </h1>
        <p className="text-gray-600 mb-8">
          We’re uploading your info and documents. You’ll be able to access your dashboard once your profile is approved.
        </p>
      </div>
    </div>
  )
}

export default VerificationWaitTime
