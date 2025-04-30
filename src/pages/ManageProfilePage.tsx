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
  Bell,
  Briefcase,
  Link2,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '../utils/AuthContext'
import { auth, db, storage } from '../utils/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import BaseLayout from '../components/Dashboard/BaseLayout'

const ACCENT = 'hsla(240,29%,54%,1)'

type TabKey =
  | 'personal'
  | 'security'
  | 'notifications'
  | 'businesses'
  | 'integration'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'personal',      label: 'Personal Info',     icon: <UserIcon /> },
  { key: 'security',      label: 'Emails & Password', icon: <Lock /> },
  { key: 'notifications', label: 'Notifications',     icon: <Bell /> },
  { key: 'businesses',    label: 'Businesses',        icon: <Briefcase /> },
  { key: 'integration',   label: 'Integration',       icon: <Link2 /> },
]

interface UserData {
  firstName: string
  lastName:  string
  email:     string
  phone:     string
  country:   string
  city:      string
  zip:       string
  avatar:    string
}

export default function ManageProfilePage() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('personal')
  const [loading, setLoading]     = useState(true)
  const [status, setStatus]       = useState<string | null>(null)

  // show the "Link Password" form only after button click
  const [showLinkForm, setShowLinkForm] = useState(false)

  // track visibility for each password field
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

  // user info form
  const [info, setInfo] = useState<UserData>({
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     '',
    country:   '',
    city:      '',
    zip:       '',
    avatar:    ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // password form (for updating or linking)
  const [passForm, setPassForm] = useState({
    current: '',
    next:    '',
    confirm: ''
  })

  // load Firestore user doc
  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.id))
      if (snap.exists()) {
        const d = snap.data() as any
        setInfo({
          firstName: d.firstName || '',
          lastName:  d.lastName  || '',
          email:     d.email     || '',
          phone:     d.phone     || '',
          country:   d.country   || '',
          city:      d.city      || '',
          zip:       d.zip       || '',
          avatar:    d.avatar    || ''
        })
      }
      setLoading(false)
    }
    load()
  }, [user])

  if (isLoading || loading) {
    return (
      <BaseLayout>
        <div className="font-nunito flex justify-center items-center h-64">
          Loading…
        </div>
      </BaseLayout>
    )
  }

  // Personal Info handlers
  const handleInfoChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInfo(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleAvatarSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setInfo(prev => ({ ...prev, avatar: URL.createObjectURL(file) }))
    }
  }

  const saveInfo = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('Saving…')
    let finalUrl = info.avatar
    if (avatarFile && user) {
      const storageRef = ref(storage, `avatars/${user.id}`)
      await uploadBytes(storageRef, avatarFile)
      finalUrl = await getDownloadURL(storageRef)
    }
    await updateDoc(doc(db, 'users', user.id), {
      firstName: info.firstName,
      lastName:  info.lastName,
      email:     info.email,
      phone:     info.phone,
      country:   info.country,
      city:      info.city,
      zip:       info.zip,
      avatar:    finalUrl
    })
    setStatus('Profile saved!')
  }

  // Password / Linking handlers
  const handlePassChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // Existing password change
  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (passForm.next !== passForm.confirm) {
      setStatus('New passwords do not match')
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
      } else if (err.code === 'auth/invalid-credential') {
        setStatus('Your current password is incorext.Please try again.')
      } else {
        setStatus(err.message)
      }
    }
  }

  

  // Link new password for Google-only accounts
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

  return (
    <BaseLayout>
      <div className="font-nunito flex bg-gray-50 min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-6 border-r">
          <h2 className="text-lg font-bold mb-6">User profile management</h2>
          <nav className="space-y-2">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatus(null)
                  setActiveTab(tab.key)
                }}
                className={`flex items-center gap-3 w-full text-left p-2 rounded ${
                  activeTab === tab.key
                    ? 'bg-[hsla(240,29%,54%,0.1)] font-medium'
                    : 'hover:bg-gray-100'
                }`}
                style={{ color: activeTab === tab.key ? ACCENT : undefined }}
              >
                {React.cloneElement(tab.icon as any, { size: 18 })}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">

          {activeTab === 'personal' && (
            <form onSubmit={saveInfo} className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">Personal information</h3>
                {status === 'Saving…' && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving changes
                  </div>
                )}
                {status === 'Profile saved!' && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Saved
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="relative w-32 h-32 mb-6">
                <img
                  src={info.avatar || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border"
                />
                <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
                  <Camera size={20} color={ACCENT} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={info.firstName}
                    onChange={handleInfoChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
                <div>
                  <label className="block mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={info.lastName}
                    onChange={handleInfoChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={info.email}
                    onChange={handleInfoChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
                <div>
                  <label className="block mb-1">Phone Number</label>
                  <input
                    name="phone"
                    value={info.phone}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Country</label>
                  <input
                    name="country"
                    value={info.country}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
                <div>
                  <label className="block mb-1">City</label>
                  <input
                    name="city"
                    value={info.city}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
                <div>
                  <label className="block mb-1">Zip Code</label>
                  <input
                    name="zip"
                    value={info.zip}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 px-5 py-2 rounded text-white"
                style={{ backgroundColor: ACCENT }}
              >
                Save changes
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            isGoogleOnly ? (
              <>
                <div className="space-y-4 max-w-md">
                  <h3 className="text-2xl font-semibold mb-2">Create a Password</h3>
                  <p className="text-gray-700">
                    We see you signed in with Google. If you’d like to
                    sign in with email & password in the future, you can set up
                    a separate app password now.
                  </p>
                  <button
                    onClick={() => {
                      setStatus(null)
                      setShowLinkForm(true)
                    }}
                    className="mt-4 px-5 py-2 rounded text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Link Password
                  </button>
                </div>

                {showLinkForm && (
                  <form onSubmit={linkPassword} className="space-y-6 max-w-md mt-6 relative">
                    <button
                      type="button"
                      onClick={() => setShowLinkForm(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      aria-label="Close"
                    >
                      ×
                    </button>

                    <h3 className="text-2xl font-semibold mb-4">Set App Password</h3>

                    <div className="relative">
                      <label className="block mb-1">New Password</label>
                      <input
                        type={showPass.next ? 'text' : 'password'}
                        name="next"
                        value={passForm.next}
                        onChange={handlePassChange}
                        required
                        className="w-full px-3 py-2 border rounded"
                        style={{ borderColor: ACCENT }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow('next')}
                        className="absolute right-3 top-1/2 -translate-y-1/2  mt-4"
                        aria-label="Toggle password visibility"
                      >
                        {showPass.next ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block mb-1">Confirm Password</label>
                      <input
                        type={showPass.confirm ? 'text' : 'password'}
                        name="confirm"
                        value={passForm.confirm}
                        onChange={handlePassChange}
                        required
                        className="w-full px-3 py-2 border rounded"
                        style={{ borderColor: ACCENT }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShow('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2  mt-4"
                        aria-label="Toggle password visibility"
                      >
                        {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 px-5 py-2 rounded text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Link Password
                    </button>

                    {status && (
                      <p className="mt-2 text-red-600">{status}</p>
                    )}
                  </form>
                )}
              </>
            ) : (
              <form onSubmit={savePassword} className="space-y-6 max-w-md">
                <h3 className="text-2xl font-semibold mb-4">Emails & Password</h3>

                <div className="relative">
                  <label className="block mb-1">Current Password</label>
                  <input
                    type={showPass.current ? 'text' : 'password'}
                    name="current"
                    value={passForm.current}
                    onChange={handlePassChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2  mt-4"
                    aria-label="Toggle password visibility"
                  >
                    {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block mb-1">New Password</label>
                  <input
                    type={showPass.next ? 'text' : 'password'}
                    name="next"
                    value={passForm.next}
                    onChange={handlePassChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('next')}
                    className="absolute right-3 top-1/2 -translate-y-1/2  mt-4"
                    aria-label="Toggle password visibility"
                  >
                    {showPass.next ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block mb-1">Confirm Password</label>
                  <input
                    type={showPass.confirm ? 'text' : 'password'}
                    name="confirm"
                    value={passForm.confirm}
                    onChange={handlePassChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                    style={{ borderColor: ACCENT }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2  mt-4"
                    aria-label="Toggle password visibility"
                  >
                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex space-x-4 mt-4">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Update password
                  </button>
                </div>

                {status && (
                  <p className="mt-2 text-red-600">{status}</p>
                )}
              </form>
            )
          )}

          {/* Placeholder for future tabs */}
          {['notifications','businesses','integration'].includes(activeTab) && (
            <div className="text-gray-500 italic">Coming soon…</div>
          )}
        </main>
      </div>
    </BaseLayout>
  )
}
