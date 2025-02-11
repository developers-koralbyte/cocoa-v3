import React from 'react'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { IoMdAdd } from 'react-icons/io'
import { GiPin } from 'react-icons/gi'
import { IoShareSocial } from 'react-icons/io5'
import { IoNotifications } from 'react-icons/io5'
import BaseLayout from '../../components/Dashboard/BaseLayout'


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

const AccountingSoftware = () => {
    const softwareLogos = [
        {
            name: 'Xero',
            src: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&q=80&w=80&h=80',
        },
        {
            name: 'QuickBooks',
            src: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&q=80&w=80&h=80',
        },
        {
            name: 'Excel',
            src: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&q=80&w=80&h=80',
        },
    ]

    const ratings = [
        { stars: 5, percentage: 45 },
        { stars: 4, percentage: 30 },
        { stars: 3, percentage: 15 },
        { stars: 2, percentage: 7 },
        { stars: 1, percentage: 3 },
    ]

    return (
        <BaseLayout>
            <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-8">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-40 h-40 rounded-full bg-purple-100 flex items-center justify-center">
                            <img
                                src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&q=80&w=160&h=160"
                                alt="Accounting Software"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <h1 className="text-4xl font-bold font-nunito">
                            Accounting Software
                        </h1>
                    </div>

                    <section className="mb-12">
                        <h2 className="text-xl font-semibold mb-4 font-nunito">
                            Service description
                        </h2>
                        <p className="text-gray-600 bg-gray-50 px-4 py-6 rounded-lg font-nunito max-w-2xl mx-auto">
                            Comprehensive accounting software solution designed
                            for businesses of all sizes. Features include
                            automated bookkeeping, real-time financial
                            reporting, expense tracking, and seamless
                            integration with popular banking platforms. Our
                            software streamlines your financial operations while
                            ensuring accuracy and compliance.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-xl font-semibold mb-4 font-nunito">
                            Software experience
                        </h2>
                        <div className="flex gap-4">
                            {softwareLogos.map((logo, index) => (
                                <div
                                    key={index}
                                    className="w-12 h-12 bg-black rounded-full flex items-center justify-center"
                                >
                                    <img
                                        src={logo.src}
                                        alt={logo.name}
                                        className="w-8 h-8"
                                    />
                                </div>
                            ))}
                            <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <IoMdAdd className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-4 font-nunito ">
                            Reviews
                        </h2>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-5xl font-bold font-nunito">
                                    4.1
                                </div>
                                <div className="flex gap-1 my-2">
                                    {[1, 2, 3, 4].map((star) => (
                                        <AiFillStar
                                            key={star}
                                            className="w-5 h-5 text-purple-600"
                                        />
                                    ))}
                                    <AiOutlineStar className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                {ratings.map((rating, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 mb-2"
                                    >
                                        <span className="w-3">
                                            {rating.stars}
                                        </span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-600 rounded-full"
                                                style={{
                                                    width: `${rating.percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="border-t pt-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold font-nunito text-xl">
                                            Jerry,
                                        </h3>
                                        <span className="text-purple-600 font-nunito font-bold text-xl">
                                            NexEra Systems
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Star Ratings */}
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((star) => (
                                                <AiFillStar
                                                    key={star}
                                                    className="w-4 h-4 text-purple-600"
                                                />
                                            ))}
                                            <AiOutlineStar className="w-4 h-4 text-gray-300" />
                                        </div>
                                        {/* Timestamp */}
                                        <span className="text-gray-400 text-sm">
                                            • A week ago
                                        </span>
                                    </div>
                                    {/* Category Tag */}
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md opacity-70 mt-3 inline-flex ">
                                        Accounting Software
                                    </span>
                                </div>
                            </div>
                            {/* Review Text */}
                            <p className="text-gray-600 mb-4 font-nunito">
                                Exceptional accounting software that has
                                transformed our financial management. The
                                interface is intuitive, and the automated
                                features save us countless hours. Real-time
                                reporting capabilities have improved our
                                decision-making process significantly.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-4">
                                <button className="text-purple-600 flex items-center gap-2">
                                    <GiPin className="w-6 h-6 font-nunito" />
                                </button>
                                <button className="text-purple-600 flex items-center gap-2">
                                    <IoShareSocial className="w-6 h-6 font-nunito" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Panel */}
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
                                        <IoNotifications className="w-4 h-4 text-purple-600" />
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
    )
}

export default AccountingSoftware
