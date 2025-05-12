import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../utils/AuthContext'
import { Search, RotateCcw, Bell, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../../utils/firebase'
import { serviceImageMap } from '../../utils/serviceImages'

const defaultAvatar = '/path-to-default-avatar.jpg'

// ---------------- DUMMY DATA ----------------
const appointments = [
    {
        name: 'Ali, KoralByte Technologies',
        company: '40% match with your products',
        time: '10:00 am – 10:30 am',
        date: 'Wed 22',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Peter, Accountrix',
        company: '38% match with your products',
        time: '1:00 pm – 1:30 pm',
        date: 'Fri 24',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Smith, CFO Services',
        company: 'Startup Hub',
        time: '10:00 am – 10:30 am',
        date: 'Mon 27',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    },
]

const buyers = [
    {
        name: 'Ali,',
        company: 'KoralByte Technologies',
        match: 93,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Cindy,',
        company: 'Greatlight Tech',
        match: 87,
        image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Junwei,',
        company: 'Sogood Office',
        match: 82,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Kazuma,',
        company: 'Hightech System',
        match: 78,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
    },
]
// --------------------------------------------

const BuyerDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

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
            }
        }
        load()
    }, [])

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
                    const vendorSnap = await getDoc(
                        doc(db, 'Vendors', vendorId)
                    )
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
                <div className="flex items-center justify-center h-screen">
                    Loading…
                </div>
            </BaseLayout>
        )

    /* ======================= JSX ======================= */
    return (
        <BaseLayout>
            <div className="flex min-h-screen bg-transparent">
                {/* ------------ MAIN COLUMN ------------ */}
                <main className="flex-1 p-8">
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-bold font-nunito">
                            Welcome, {user?.firstName || 'Buyer'}
                        </h1>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search services or products…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                className="p-2 border rounded-full shadow-sm focus:outline-none w-56 sm:w-64"
                            />
                            <Search className="w-5 h-5 text-gray-600" />
                            <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                <RotateCcw className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </header>

                    {/* -------- Services of Interest -------- */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 font-nunito">
                            Services of Interest
                        </h2>
                        {services.length ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {services.map((serviceName) => {
                                    const imgSrc =
                                        serviceImageMap[serviceName] ||
                                        `https://via.placeholder.com/150?text=${encodeURIComponent(serviceName)}`
                                    return (
                                        <button
                                            key={serviceName}
                                            onClick={() =>
                                                navigate(
                                                    `/search?query=${encodeURIComponent(serviceName)}`
                                                )
                                            }
                                            className="text-center focus:outline-none"
                                        >
                                            <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                                <img
                                                    src={imgSrc}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-800">
                                                {serviceName}
                                            </h3>
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                No services selected yet.
                            </p>
                        )}
                    </section>

                    {/* -------- Recent Vendors -------- */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 font-nunito">
                            Recent Vendors
                        </h2>
                        {recentVendors.length ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {recentVendors.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() =>
                                            navigate('/inbox', {
                                                state: { vendorId: v.id },
                                            })
                                        }
                                        className="text-center focus:outline-none"
                                    >
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={v.image}
                                                alt={v.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-800">
                                            {v.name + ', ' + v.company}
                                        </h3>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent vendors.</p>
                        )}
                    </section>

                    
                    
                </main>

                {/* ------------ RIGHT SIDEBAR ------------ */}
                <aside className="w-96 bg-purple-100 p-8 rounded-r-[3.5rem] flex flex-col gap-8">
                    {/* Profile */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="text-gray-400 w-6 h-6" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold font-nunito">
                                {user?.firstName || 'Buyer'},
                            </h2>
                            <span className="text-sm text-gray-600">Buyer</span>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <section className="bg-white rounded-[2rem] p-6 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold font-nunito">
                                Upcoming Appointments
                            </h3>
                            <div className="flex gap-2 text-purple-600 select-none">
                                <button>&lt;</button>
                                <button>&gt;</button>
                            </div>
                        </div>
                        <div className="space-y-4 overflow-y-auto max-h-60 pr-2">
                            {appointments.map((apt) => (
                                <div
                                    key={apt.name}
                                    className="flex items-center gap-4"
                                >
                                    <img
                                        src={apt.image}
                                        alt={apt.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium">
                                            {apt.name}{' '}
                                            <span className="text-purple-600">
                                                {apt.company}
                                            </span>
                                        </h4>
                                        <div className="text-sm text-gray-500">
                                            {apt.date}, {apt.time}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            alert(
                                                `Reminder set for ${apt.name}`
                                            )
                                        }
                                    >
                                        <Bell className="w-4 h-4 text-purple-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Your Buyers */}
                    <section className="bg-white rounded-[2rem] p-6">
                        <h3 className="font-bold mb-4 font-nunito">
                            Your Buyers
                        </h3>
                        <div className="space-y-4 overflow-y-auto max-h-60 pr-2">
                            {buyers.map((b) => (
                                <div
                                    key={b.name}
                                    className="flex items-center gap-4"
                                >
                                    <img
                                        src={b.image}
                                        alt={b.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="font-medium">
                                            {b.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {b.company}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>

            {/* ---------------- COMPLETE PROFILE POPUP ---------------- */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded shadow-md w-[400px] space-y-4"
                    >
                        <h2 className="text-xl font-semibold">
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
                                    className="border border-gray-300 p-2 w-full rounded"
                                    required
                                />
                            </div>
                        ))}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowPopup(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </BaseLayout>
    )
}

export default BuyerDashboard
