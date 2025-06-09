// src/pages/VerificationWaitTime.tsx
import React, { useEffect } from 'react'
import { auth, db } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'
import cocoaImg from '../assets/img/cocoa-logo.png'
import verificationWait from '../assets/img/Verification/verificationWait.png'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../utils/upload'
import { toast } from 'react-toastify'

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

interface Props {
  user: import('firebase/auth').User
  formData: FormData
  avatarFile: File | null
}

const VerificationWaitTime: React.FC<Props> = ({ user, formData, avatarFile }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(async () => {
      await user.reload()
      if (user.emailVerified) {
        clearInterval(interval)

        try {
          // 1. upload avatar if provided
          let avatarUrl = ''
          if (avatarFile) {
            avatarUrl = (await upload(avatarFile)) as string
          }

          // 2. write to "users" collection
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: formData.email,
            role: formData.role.toLowerCase(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            avatar: avatarUrl,
            blocked: [],
            createdAt: new Date(),
          })

          // 3. write to "Buyers" collection
          await setDoc(doc(db, 'Buyers', user.uid), {
            ...formData,
            role: formData.role.toLowerCase(),
            emailVerified: true,
            uid: user.uid,
            avatar: avatarUrl,
            blocked: [],
            createdAt: new Date(),
            categories: formData.categories
              .split(',')
              .map(cat => cat.trim().toLowerCase()),
          })

          // 4. redirect based on role
          if (formData.role.toLowerCase() === 'vendor') {
            navigate('/vendor-dashboard', { replace: true })
          } else {
            navigate('/buyer-dashboard', { replace: true })
          }
        } catch (err: any) {
          console.error('Error writing Firestore after verification:', err)
          toast.error('An error occurred. Please contact support.')
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user, formData, avatarFile, navigate])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 mb-6">
        <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
          <img src={cocoaImg} alt="Cocoa Logo" className="w-[180px] h-[90px]" />
        </a>
      </div>
      <div className="mb-8">
        <img
          src={verificationWait}
          alt="Verification Wait"
          className="max-w-[150px] h-auto mb-6"
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        Verification in Progress
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-12 font-nunito">
        Thanks for signing up! We're reviewing your account information and email verification.
      </p>
      <button
        className="px-8 py-3 bg-[#7C77C1] text-white rounded-full hover:bg-[#6661B0] transition-colors"
        onClick={() => (window.location.href = '/')}
      >
        Explore Homepage
      </button>
    </div>
  )
}

export default VerificationWaitTime
