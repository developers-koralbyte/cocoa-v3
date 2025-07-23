// src/pages/ManageProfilePage.tsx
import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent
} from 'react'
import {
  User as UserIcon,
  Lock,
  Briefcase,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../utils/AuthContext'
import { auth, db, storage } from '../utils/firebase'
import {
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore'
import {
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth'
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage'
import BaseLayout from '../components/Dashboard/BaseLayout'

const ACCENT = 'hsla(240,29%,54%,1)'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*_\-+=`|(){}\[\]:;"'<>,.?/]).{8,}$/

type TabKey = 'personal' | 'security' | 'businesses'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'personal',   label: 'Personal Info', icon: <UserIcon /> },
  { key: 'security',   label: 'Security',      icon: <Lock /> },
  { key: 'businesses', label: 'Company Info',  icon: <Briefcase /> },
]

interface UserData {
  firstName:  string
  lastName:   string
  email:      string
  phone:      string
  province:   string
  city:       string
  postalCode: string
  avatar:     string
}

export default function ManageProfilePage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [loading, setLoading]     = useState(true)
  const [status, setStatus]       = useState<string | null>(null)
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 768 && window.innerWidth <= 1024
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 768)
      setIsTablet(width > 768 && width <= 1024)
      
      // Auto-close sidebar on desktop
      if (width > 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // password linking & visibility
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [showPass, setShowPass] = useState<{ current: boolean; next: boolean; confirm: boolean }>({
    current: false,
    next:    false,
    confirm: false
  })
  const toggleShow = (field: 'current' | 'next' | 'confirm') =>
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }))

  // detect providers
  const providers = auth.currentUser?.providerData.map(p => p.providerId) || []
  const hasPasswordProvider = providers.includes('password')
  const isGoogleOnly = providers.includes('google.com') && !hasPasswordProvider

  // user info
  const [info, setInfo] = useState<UserData>({
    firstName:  '',
    lastName:   '',
    email:      '',
    phone:      '',
    province:   '',
    city:       '',
    postalCode: '',
    avatar:     ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // email-change form
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailForm, setEmailForm] = useState({ newEmail: '', confirm: '' })

  // password-change form
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' })

  // load Firestore user doc
  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.id))
      if (snap.exists()) {
        const d = snap.data() as any
        setInfo({
          firstName:  d.firstName  || '',
          lastName:   d.lastName   || '',
          email:      d.email      || '',
          phone:      d.phone      || '',
          province:   d.province   || '',
          city:       d.city       || '',
          postalCode: d.postalCode || '',
          avatar:     d.avatar     || ''
        })
      }
      setLoading(false)
    }
    load()
  }, [user])

  // handlers
  const handleInfoChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleAvatarSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setInfo(prev => ({ ...prev, avatar: URL.createObjectURL(file) }))
    }
  }

  const handleEmailFormChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmailForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePassChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // save profile info
  const saveInfo = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('Saving…')
    let finalUrl = info.avatar
    if (avatarFile && user) {
      const storageRef = ref(storage, `avatars/${user.id}`)
      await uploadBytes(storageRef, avatarFile)
      finalUrl = await getDownloadURL(storageRef)
    }
    await updateDoc(doc(db, 'users', user!.id), {
      firstName:  info.firstName,
      lastName:   info.lastName,
      email:      info.email,
      phone:      info.phone,
      province:   info.province,
      city:       info.city,
      postalCode: info.postalCode,
      avatar:     finalUrl
    })
    setStatus('Profile saved!')
  }

  // save email change
  const saveEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (emailForm.newEmail !== emailForm.confirm) {
      setStatus('Emails do not match.')
      return
    }
    try {
      setStatus('Updating email…')
      await updateEmail(auth.currentUser!, emailForm.newEmail)
      await updateDoc(doc(db, 'users', user!.id), { email: emailForm.newEmail })
      setInfo(prev => ({ ...prev, email: emailForm.newEmail }))
      setStatus('Email updated!')
      setShowEmailForm(false)
    } catch (err: any) {
      setStatus(err.message)
    }
  }

  // save password change
  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (passForm.next !== passForm.confirm) {
      setStatus('New passwords do not match')
      return
    }

    if (!PASSWORD_REGEX.test(passForm.next)) {
      setStatus('Password must be at least 8 characters and include uppercase, lowercase, number & special character.')
      return
    }
    try {
      setStatus('Updating password…')
      const cred = EmailAuthProvider.credential(user!.email!, passForm.current)
      await reauthenticateWithCredential(auth.currentUser!, cred)
      await updatePassword(auth.currentUser!, passForm.next)
      setStatus('Password updated!')
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setStatus('Current password is incorrect')
      } else {
        setStatus(err.message)
      }
    }
  }

  // link password for Google-only
  const linkPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (passForm.next !== passForm.confirm) {
      setStatus('Passwords do not match')
      return
    }
    try {
      setStatus('Linking password…')
      const credential = EmailAuthProvider.credential(user!.email!, passForm.next)
      await linkWithCredential(auth.currentUser!, credential)
      setStatus('Password linked! You can now sign in with email & password.')
      setShowLinkForm(false)
    } catch (err: any) {
      setStatus(err.message)
    }
  }

  const handleTabChange = (tabKey: TabKey) => {
    setStatus(null)
    setActiveTab(tabKey)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (isLoading || loading) {
    return (
      <BaseLayout>
        <div className="font-nunito flex justify-center items-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm sm:text-base">Loading…</span>
          </div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div className="font-nunito flex bg-gray-50 min-h-screen relative">
        {/* Mobile Header */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold">Profile Settings</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Responsive */}
        <aside className={`
          ${isMobile ? 'fixed top-0 left-0 h-full z-50' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'w-64' : isTablet ? 'w-56' : 'w-64'}
          bg-white border-r transition-transform duration-300 ease-in-out
          ${isMobile ? 'pt-16' : 'pt-0'}
        `}>
          <div className={`${isMobile ? 'p-4' : 'p-6'} h-full overflow-y-auto`}>
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold mb-4 sm:mb-6 ${isMobile ? 'hidden' : ''}`}>
              User profile management
            </h2>
            <nav className="space-y-1 sm:space-y-2">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 sm:gap-3 w-full text-left p-2 sm:p-3 rounded transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[hsla(240,29%,54%,0.1)] font-medium'
                      : 'hover:bg-gray-100'
                  } ${isMobile ? 'text-sm' : 'text-base'}`}
                  style={{ color: activeTab === tab.key ? ACCENT : undefined }}
                >
                  {React.cloneElement(tab.icon as any, { size: isMobile ? 16 : 18 })}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content - Responsive */}
        <main className={`
          flex-1 overflow-hidden
          ${isMobile ? 'pt-16' : 'pt-0'}
          ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'}
        `}>
          <div className="max-w-full overflow-y-auto h-full">
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Email Change - Responsive */}
                {!showEmailForm ? (
                  <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'} max-w-full ${isTablet ? 'max-w-2xl' : 'max-w-xl'}`}>
                    <div className="min-w-0 flex-1">
                      <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-1 sm:mb-2`}>
                        Email Address
                      </h3>
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 truncate`}>
                        {info.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus(null)
                        setShowEmailForm(true)
                      }}
                      className={`${isMobile ? 'w-full' : 'flex-shrink-0'} px-4 py-2 rounded text-white text-sm sm:text-base`}
                      style={{ backgroundColor: ACCENT }}
                    >
                      Change Email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={saveEmail} className={`space-y-4 sm:space-y-6 max-w-full ${isTablet ? 'max-w-2xl' : 'max-w-xl'}`}>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold`}>
                      Update Email
                    </h3>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        New Email
                      </label>
                      <input
                        type="email"
                        name="newEmail"
                        value={emailForm.newEmail}
                        onChange={handleEmailFormChange}
                        required
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        Confirm Email
                      </label>
                      <input
                        type="email"
                        name="confirm"
                        value={emailForm.confirm}
                        onChange={handleEmailFormChange}
                        required
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center space-x-4'}`}>
                      <button
                        type="submit"
                        className={`${isMobile ? 'w-full' : ''} px-5 py-2 rounded text-white text-sm sm:text-base`}
                        style={{ backgroundColor: ACCENT }}
                      >
                        Update Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className={`${isMobile ? 'w-full' : ''} px-5 py-2 rounded text-gray-600 hover:underline text-sm sm:text-base`}
                      >
                        Cancel
                      </button>
                    </div>
                    {status && (
                      <p className={`text-red-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        {status}
                      </p>
                    )}
                  </form>
                )}

                {/* Profile Info Form - Responsive */}
                <form onSubmit={saveInfo} className={`space-y-4 sm:space-y-6 max-w-full ${isTablet ? 'max-w-2xl' : 'max-w-xl'}`}>
                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold`}>
                      Personal information
                    </h3>
                    {status === 'Saving…' && (
                      <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                        <Loader2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 animate-spin`} />
                        Saving changes
                      </div>
                    )}
                    {status === 'Profile saved!' && (
                      <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-green-600`}>
                        <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                        Saved
                      </div>
                    )}
                  </div>

                  {/* Avatar - Responsive */}
                  <div className={`${isMobile ? 'flex flex-col items-center' : ''}`}>
                    <div className={`relative ${isMobile ? 'w-24 h-24' : 'w-32 h-32'} mb-4 sm:mb-6`}>
                      <img
                        src={info.avatar || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover border-2"
                        style={{ borderColor: ACCENT }}
                      />
                      <label className="absolute bottom-0 right-0 bg-white p-1 sm:p-2 rounded-full shadow cursor-pointer hover:shadow-md transition-shadow">
                        <Camera size={isMobile ? 16 : 20} color={ACCENT} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isMobile && (
                      <p className="text-xs text-gray-600 text-center mb-4">
                        Tap the camera icon to change your profile picture
                      </p>
                    )}
                  </div>

                  {/* Name - Responsive Grid */}
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        First Name
                      </label>
                      <input
                        name="firstName"
                        value={info.firstName}
                        onChange={handleInfoChange}
                        required
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        value={info.lastName}
                        onChange={handleInfoChange}
                        required
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                    </div>
                  </div>

                  {/* Phone - Responsive */}
                  <div>
                    <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      value={info.phone}
                      onChange={handleInfoChange}
                      className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                      style={{ borderColor: ACCENT }}
                    />
                  </div>

                  {/* Location (Canada) - Responsive Grid */}
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'}`}>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        Province
                      </label>
                      <select
                        name="province"
                        value={info.province}
                        onChange={handleInfoChange}
                        required
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      >
                        <option value="">Select Province</option>
                        {[
                          'AB','BC','MB','NB','NL','NS','ON','PE','QC','SK',
                          'NT','NU','YT'
                        ].map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        City
                      </label>
                      <input
                        name="city"
                        value={info.city}
                        onChange={handleInfoChange}
                        required
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        Postal Code
                      </label>
                      <input
                        name="postalCode"
                        value={info.postalCode}
                        onChange={e => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '')
                          setInfo(prev => ({ ...prev, postalCode: val }))
                        }}
                        pattern="^[A-Z]\d[A-Z][ ]?\d[A-Z]\d$"
                        title="Format: A1A 1A1"
                        required
                        placeholder="A1A 1A1"
                        className={`w-full px-3 py-2 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`${isMobile ? 'w-full' : ''} mt-4 px-5 py-2 rounded text-white text-sm sm:text-base`}
                    style={{ backgroundColor: ACCENT }}
                  >
                    Save changes
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab - Responsive */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {isGoogleOnly ? (
                  <>
                    <div className={`space-y-4 max-w-full ${isTablet ? 'max-w-2xl' : 'max-w-md'}`}>
                      <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-2`}>
                        Create a Password
                      </h3>
                      <p className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        We see you signed in with Google. If you'd like to
                        sign in with email & password in the future, you can set up
                        a separate app password now.
                      </p>
                      <button
                        onClick={() => {
                          setStatus(null)
                          setShowLinkForm(true)
                        }}
                        className={`${isMobile ? 'w-full' : ''} mt-4 px-5 py-2 rounded text-white text-sm sm:text-base`}
                        style={{ backgroundColor: ACCENT }}
                      >
                        Link Password
                      </button>
                    </div>

                    {showLinkForm && (
                      <form onSubmit={linkPassword} className={`space-y-4 sm:space-y-6 max-w-full ${isTablet ? 'max-w-2xl' : 'max-w-md'} relative`}>
                        <button
                          type="button"
                          onClick={() => setShowLinkForm(false)}
                          className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 p-1"
                          aria-label="Close"
                        >
                          <X size={20} />
                        </button>
                        <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-4`}>
                          Set App Password
                        </h3>
                        <div className="relative">
                          <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                            New Password
                          </label>
                          <input
                            type={showPass.next ? 'text' : 'password'}
                            name="next"
                            value={passForm.next}
                            onChange={handlePassChange}
                            required
                            className={`w-full px-3 py-2 pr-10 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                            style={{ borderColor: ACCENT }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleShow('next')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
                            aria-label="Toggle password visibility"
                          >
                            {showPass.next ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="relative">
                          <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                            Confirm Password
                          </label>
                          <input
                            type={showPass.confirm ? 'text' : 'password'}
                            name="confirm"
                            value={passForm.confirm}
                            onChange={handlePassChange}
                            required
                            className={`w-full px-3 py-2 pr-10 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                            style={{ borderColor: ACCENT }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleShow('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
                            aria-label="Toggle password visibility"
                          >
                            {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className={`${isMobile ? 'w-full' : ''} mt-4 px-5 py-2 rounded text-white text-sm sm:text-base`}
                          style={{ backgroundColor: ACCENT }}
                        >
                          Link Password
                        </button>
                        {status && (
                          <p className={`text-red-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                            {status}
                          </p>
                        )}
                      </form>
                    )}
                  </>
                ) : (
                  <form onSubmit={savePassword} className={`space-y-4 sm:space-y-6 max-w-full ${isTablet ? 'max-w-2xl' : 'max-w-md'}`}>
                    <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-4`}>
                      Password
                    </h3>
                    <div className="relative">
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        Current Password
                      </label>
                      <input
                        type={showPass.current ? 'text' : 'password'}
                        name="current"
                        value={passForm.current}
                        onChange={handlePassChange}
                        required
                        className={`w-full px-3 py-2 pr-10 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
                        aria-label="Toggle password visibility"
                      >
                        {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        New Password
                      </label>
                      <input
                        type={showPass.next ? 'text' : 'password'}
                        name="next"
                        value={passForm.next}
                        onChange={handlePassChange}
                        required
                        className={`w-full px-3 py-2 pr-10 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow('next')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
                        aria-label="Toggle password visibility"
                      >
                        {showPass.next ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label className={`block mb-1 ${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
                        Confirm Password
                      </label>
                      <input
                        type={showPass.confirm ? 'text' : 'password'}
                        name="confirm"
                        value={passForm.confirm}
                        onChange={handlePassChange}
                        required
                        className={`w-full px-3 py-2 pr-10 border rounded ${isMobile ? 'text-sm' : 'text-base'}`}
                        style={{ borderColor: ACCENT }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
                        aria-label="Toggle password visibility"
                      >
                        {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className={`${isMobile ? 'w-full' : ''} px-5 py-2 rounded text-white text-sm sm:text-base`}
                      style={{ backgroundColor: ACCENT }}
                    >
                      Update password
                    </button>
                    {status && (
                      <p className={`text-red-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                        {status}
                      </p>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Company Info / Businesses Tab - Responsive */}
            {activeTab === 'businesses' && (
              <div className="max-w-full">
                <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-4`}>
                  Company Information
                </h3>
                <div className="bg-gray-100 rounded-lg p-6 sm:p-8 text-center">
                  <Briefcase 
                    size={isMobile ? 48 : 64} 
                    className="mx-auto text-gray-400 mb-4" 
                  />
                  <p className={`text-gray-500 italic ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Company management features coming soon…
                  </p>
                  <p className={`text-gray-400 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Manage business profiles, team members, and company settings
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </BaseLayout>
  )
}