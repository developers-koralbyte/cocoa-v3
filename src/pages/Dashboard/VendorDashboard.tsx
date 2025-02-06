import React from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Bell } from 'lucide-react' // or use any other bell icon if needed
import { useNavigate } from 'react-router-dom'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import chatImage from '../../assets/img/Dashboard/chatImage.png'

interface Appointment {
    name: string
    company: string
    time: string
    date: string
    image: string
}

interface Buyer {
    name: string
    company: string
    match: number
    image: string
}

const appointments: Appointment[] = [
    {
        name: 'Gustavo',
        company: 'Creative Hive',
        time: '9:00am - 9:30am',
        date: 'Wed 22',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Diana',
        company: 'TechNest',
        time: '1:00pm - 1:30pm',
        date: 'Fri 24',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Amrit',
        company: 'Startup Hub',
        time: '10:00am - 10:30am',
        date: 'Mon 27',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    },
]

const buyers: Buyer[] = [
    {
        name: 'Diana',
        company: 'TechNest',
        match: 93,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Kevin',
        company: 'FlexSpace Studios',
        match: 87,
        image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Margaret',
        company: 'OfficeOne Hub',
        match: 82,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        name: 'Yihao',
        company: 'Collaborative HQ',
        match: 78,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
    },
]

const popularServices = [
    {
        title: 'Audit Services',
        image: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'Accounting and Bookkeeping Services',
        image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=150&h=150',
    },
]

const services = [
    {
        title: 'Accounting Software',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'CFO Services',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'Audit Services',
        image: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=150&h=150',
    },
    {
        title: 'Accounting and Bookkeeping Services',
        image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=150&h=150',
    },
]

const VendorDashboard = () => {
    const navigate = useNavigate()

    return (
        <>
            <BaseLayout>
                <div className="flex min-h-screen bg-transparent">
                    <div className="flex-1 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-bold font-nunito">
                                Welcome Peter,
                            </h1>
                            <div className="flex gap-4">
                                <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <Search className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <RotateCcw className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 font-nunito">
                                My Catalogue
                            </h2>
                            <div className="grid grid-cols-4 gap-6">
                                {services.map((service, index) => (
                                    <div key={index} className="text-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium">
                                            {service.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 font-nunito">
                                My Popular Services
                            </h2>
                            <div className="grid grid-cols-4 gap-6">
                                {popularServices.map((service, index) => (
                                    <div key={index} className="text-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium">
                                            {service.title}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 font-nunito text-purple-400">
                                Your Potential Buyers
                            </h2>
                            <p className="text-gray-600 mb-6 font-nunito">
                                These buyer's interests match your services, you
                                can reach them with a one-time message.
                            </p>
                            <div className="grid grid-cols-4 gap-6">
                                {buyers.slice(0, 4).map((buyer, index) => (
                                    <div key={index} className="text-center">
                                        <div className="w-full aspect-square mb-4 overflow-hidden rounded-full shadow-sm hover:shadow-md transition-shadow">
                                            <img
                                                src={buyer.image}
                                                alt={buyer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium">
                                            {buyer.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {buyer.company}
                                        </p>
                                        <p className="text-sm text-purple-600 mt-1">
                                            {buyer.match}% match
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right panel */}
                    <div className="w-96 bg-purple-100 p-8 rounded-r-[3.5rem]">
                        {/* Profile Section */}
                        <div className="flex items-center justify-center gap-x-5 gap-4 mb-8">
                            <div>
                                <h2 className="font-bold font-nunito">
                                    Peter, Accountix
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 font-nunito">
                                        Vendor
                                    </span>
                                    <span className="text-xs bg-purple-200 px-2 py-1 rounded-full font-nunito">
                                        Premium Account
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150"
                                    alt="Peter"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <section className="bg-white rounded-[2rem] p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold font-nunito">
                                    Upcoming Appointments
                                </h3>
                                <div className="flex gap-2">
                                    <button className="text-purple-600">
                                        &lt;
                                    </button>
                                    <button className="text-purple-600">
                                        &gt;
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {appointments.map((apt, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img
                                                src={apt.image}
                                                alt={apt.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h4 className="font-medium">
                                                    {apt.name},{' '}
                                                    <span className="text-purple-600">
                                                        {apt.company}
                                                    </span>
                                                </h4>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {apt.date}, {apt.time}
                                            </div>
                                        </div>
                                        <div
                                            className="cursor-pointer"
                                            onClick={() =>
                                                alert(
                                                    `Reminder set for ${apt.name}`
                                                )
                                            }
                                        >
                                            <Bell className="w-4 h-4 text-purple-600" />{' '}
                                            {/* Smaller bell */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Your Buyers Section */}
                        <section className="bg-white rounded-[2rem] p-6">
                            <h3 className="font-bold mb-4">Your buyers</h3>
                            <div className="space-y-4">
                                {buyers.map((buyer, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img
                                                src={buyer.image}
                                                alt={buyer.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">
                                                {buyer.name}
                                            </h4>
                                            <p className="text-md text-purple-600 font-bold">
                                                {buyer.company}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </BaseLayout>

            {/* Chat Image/Button - Fixed at bottom-right */}
            <div
                className="fixed bottom-3 right-10 cursor-pointer z-50"
                onClick={() => navigate('/chat')}
            >
                <img
                    src={chatImage}
                    alt="Chat"
                    className="hover:opacity-90 transition-opacity"
                />
            </div>
        </>
    )
}

export default VendorDashboard
