import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../utils/AuthContext'
import { Search, RotateCcw, Bell, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore'
import { db, auth } from '../../utils/firebase'
import { serviceImageMap } from '../../utils/serviceImages'
import moment from 'moment'

const defaultAvatar = '/path-to-default-avatar.jpg'

interface Appointment {
  id: string
  name: string
  company: string
  date: string
  time: string
  image: string
}

const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()

  const buyerId = user?.uid
  if (!buyerId && !isLoading) {
    navigate('/login')
    return null
  }

  /* ---------------- LOCAL STATE ---------------- */
  const [services, setServices] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingDocCheck, setLoadingDocCheck] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    countryRegion: '',
    industry: '',
    categories: '',
    services: '',
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [upcomingIndex, setUpcomingIndex] = useState(0)

  // Track premium status
  const [isPremium, setIsPremium] = useState(false)
  const [businessName, setBusinessName] = useState('')

  // New state for recent vendors
  const [recentVendors, setRecentVendors] = useState<
    { id: string; name: string; image: string; company: string }[]
  >([])

  /* ------------ fetch buyer-selected services ------------- */
  useEffect(() => {
    const load = async () => {
      const curr = auth.currentUser
      if (!curr) return
      const snap = await getDoc(doc(db, 'Buyers', curr.uid))
      if (snap.exists()) {
        const data = snap.data()
        if (Array.isArray(data.services)) setServices(data.services)
        // Set premium status and business name
        setIsPremium(data.isPremium || false)
        setBusinessName(data.businessName || '')
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!buyerId) return
    const fetchAppointments = async () => {
      const apptQ = query(
        collection(db, 'appointments'),
        where('buyerId', '==', buyerId)
      )
      const snap = await getDocs(apptQ)
      const items: Appointment[] = await Promise.all(
        snap.docs.map(async (ds) => {
          const d = ds.data()
          const vid = d.vendorId as string
          // vendor user doc
          const usnap = await getDoc(doc(db, 'users', vid))
          const u = usnap.exists() ? usnap.data() : {}
          // vendor business doc
          const vsnap = await getDoc(doc(db, 'Vendors', vid))
          const v = vsnap.exists() ? vsnap.data() : {}
          // parse date/time
          const raw = d.selectedDate?.toDate
            ? d.selectedDate.toDate()
            : new Date(d.selectedDate)
          const start = moment(raw)
          if (d.selectedTime) {
            const tm = moment(d.selectedTime, 'h:mm A')
            start.hours(tm.hours()).minutes(tm.minutes())
          }
          const end = start.clone().add(30, 'minutes')
          return {
            id: ds.id,
            name: u.firstName || 'Unknown',
            company: v.businessName || '',
            image: u.avatar || '',
            date: start.format('ddd D'),
            time: `${start.format('h:mm A')} - ${end.format('h:mm A')}`,
          }
        })
      )
      items.sort((a, b) => {
        const aM = moment(
          a.date + ' ' + a.time.split(' - ')[0],
          'ddd D h:mm A'
        )
        const bM = moment(
          b.date + ' ' + b.time.split(' - ')[0],
          'ddd D h:mm A'
        )
        return aM.valueOf() - bM.valueOf()
      })
      setAppointments(items)
      setUpcomingIndex(0)
    }
    fetchAppointments()
  }, [buyerId])

  /* ---------- profile completeness check ---------- */
  useEffect(() => {
    const run = async () => {
      if (!user?.id || user.role !== 'buyer') return navigate('/login')
      const snap = await getDoc(doc(db, 'Buyers', user.id))
      if (!snap.exists()) {
        setShowPopup(true)
        return setLoadingDocCheck(false)
      }
      const d = snap.data()
      const required = [
        'businessName',
        'countryRegion',
        'industry',
        'categories',
        'services',
      ]
      const incomplete = required.some((f) => !d?.[f])
      if (incomplete) {
        setFormData({
          businessName: d.businessName || '',
          countryRegion: d.countryRegion || '',
          industry: d.industry || '',
          categories: d.categories || '',
          services: d.services || '',
        })
        setShowPopup(true)
      }
      setLoadingDocCheck(false)
    }
    run()
  }, [user, navigate])

  /* ----------- recent vendors from chats ----------- */
  useEffect(() => {
    if (!user?.id) return
    const userChatsRef = doc(db, 'userchats', user.id)
    const unsub = onSnapshot(userChatsRef, async (snap) => {
      const data = snap.data()
      if (!data?.chats?.length) {
        setRecentVendors([])
        return
      }
      const sorted = (data.chats as any[])
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 8)

      const vendors = await Promise.all(
        sorted.map(async (c) => {
          const vendorId = c.receiverId
          const userSnap = await getDoc(doc(db, 'users', vendorId))
          const vendorSnap = await getDoc(doc(db, 'Vendors', vendorId))
          const u = userSnap.exists() ? userSnap.data() : {}
          const v = vendorSnap.exists() ? vendorSnap.data() : {}
          return {
            id: vendorId,
            name: u.firstName || u.name || 'Vendor',
            image: u.avatar || defaultAvatar,
            company: v.businessName || '',
          }
        })
      )
      setRecentVendors(vendors)
    })
    return () => unsub()
  }, [user?.id])

  /* ---------------- event handlers ---------------- */
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handlePrevUpcoming = () => setUpcomingIndex((i) => Math.max(i - 1, 0))
  const handleNextUpcoming = () =>
    setUpcomingIndex((i) => Math.min(i + 1, appointments.length - 1))

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    await setDoc(doc(db, 'Buyers', user.id), formData, { merge: true })
    setShowPopup(false)
  }

  if (loadingDocCheck)
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-screen">Loading…</div>
      </BaseLayout>
    )

  /* ======================= JSX ======================= */
  return (
    <BaseLayout>
    
      <div className="flex flex-col lg:flex-row min-h-0">
        {/* ------------ MAIN CONTENT ------------ */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <header>
              <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-nunito leading-tight">
                  Welcome, {user?.firstName || 'Buyer'}
                </h1>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative flex-1 lg:flex-none">
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearch}
                      className="w-full lg:w-48 xl:w-64 p-2 pr-8 border rounded-full shadow-sm focus:outline-none text-sm"
                    />
                    <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                  </div>
                  <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </header>

            {/* Scrollable content in main */}
            <section>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 font-nunito">
                Services of Interest
              </h2>
              {services.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  {services.slice(0, 8).map((serviceName) => {
                    const imgSrc =
                      serviceImageMap[serviceName] ||
                      `https://via.placeholder.com/150?text=${encodeURIComponent(
                        serviceName
                      )}`
                    return (
                      <button
                        key={serviceName}
                        onClick={() =>
                          navigate(
                            `/search?query=${encodeURIComponent(serviceName)}`
                          )
                        }
                        className="text-center focus:outline-none group"
                      >
                        <div className="w-full aspect-square mb-2 overflow-hidden rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                          <img
                            src={imgSrc}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-xs md:text-sm font-medium text-gray-800 truncate">
                          {serviceName}
                        </h3>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm md:text-base">
                  No services selected yet.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 font-nunito">
                Recent Vendors
              </h2>
              {recentVendors.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  {recentVendors.slice(0, 8).map((v) => (
                    <button
                      key={v.id}
                      onClick={() =>
                        navigate('/inbox', {
                          state: { vendorId: v.id },
                        })
                      }
                      className="text-center focus:outline-none group"
                    >
                      <div className="w-full aspect-square mb-2 overflow-hidden rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2">
                        {v.name}
                        {v.company ? `, ${v.company}` : ''}
                      </h3>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm md:text-base">
                  No recent vendors.
                </p>
              )}
            </section>
          </div>
        </main>

        {/* ------------ RIGHT SIDEBAR ------------ */}
        {/*
          1. We removed the parent’s `h-full overflow-y-auto`.
          2. The flex parent has `min-h-0`, so if the content of the sidebar
             is too tall, the <div className="overflow-y-auto ..."> inside it
             will scroll, but it won’t push the whole page taller than the viewport.
        */}
        <aside className="lg:w-80 xl:w-96 bg-purple-100 lg:rounded-r-[3.5rem] flex-shrink-0 min-h-0">
          <div className="overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Profile Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate">
                    {user?.firstName || 'Buyer'}
                    {businessName ? `, ${businessName}` : ''}
                  </h2>
                  <div className="flex flex-col">
                    <span className="text-base md:text-lg lg:text-xl text-gray-600 capitalize">
                      Buyer
                    </span>
                    {isPremium && (
                      <div className="flex items-center text-purple-600 text-sm md:text-base lg:text-xl mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="italic">Premium Account</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden flex-shrink-0 ml-4">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <User className="text-white w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <section className="bg-white rounded-2xl lg:rounded-[2rem] p-4 md:p-5 lg:p-6 flex-1 min-h-0">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-bold font-nunito">
                  Upcoming Appointment
                </h3>
                <div className="flex gap-2 text-purple-600 select-none">
                  <button
                    onClick={handlePrevUpcoming}
                    disabled={upcomingIndex === 0}
                    className="disabled:opacity-50 text-lg"
                  >
                    &lt;
                  </button>
                  <button
                    onClick={handleNextUpcoming}
                    disabled={upcomingIndex === appointments.length - 1}
                    className="disabled:opacity-50 text-lg"
                  >
                    &gt;
                  </button>
                </div>
              </div>

              {appointments.length ? (
                (() => {
                  const appt = appointments[upcomingIndex]
                  return (
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {appt.image ? (
                          <img
                            src={appt.image}
                            alt={appt.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <User className="text-gray-400 w-4 h-4 md:w-6 md:h-6 m-1 md:m-2" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="font-medium text-sm md:text-base truncate">
                          {appt.name}
                        </div>
                        <div className="text-purple-600 text-xs md:text-sm truncate">
                          {appt.company || 'No company info'}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          {appt.date}, {appt.time}
                        </div>
                      </div>
                      <Bell
                        className="w-4 h-4 text-purple-600 cursor-pointer flex-shrink-0"
                        onClick={() =>
                          alert(`Reminder set for ${appt.name}`)
                        }
                      />
                    </div>
                  )
                })()
              ) : (
                <p className="text-gray-500 text-sm md:text-base">
                  No upcoming appointments.
                </p>
              )}
            </section>
          </div>
        </aside>

        {/* ---------------- COMPLETE PROFILE POPUP ---------------- */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-4 md:p-6 rounded shadow-md w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg md:text-xl font-semibold">
                Complete Your Profile
              </h2>
              {[
                'businessName',
                'countryRegion',
                'industry',
                'categories',
                'services',
              ].map((f) => (
                <div key={f} className="space-y-1">
                  <label className="block text-sm font-medium capitalize">
                    {f.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    name={f}
                    value={(formData as any)[f] || ''}
                    onChange={handleFormChange}
                    className="border border-gray-300 p-2 w-full rounded text-sm"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </BaseLayout>
  )
}

export default BuyerDashboard
