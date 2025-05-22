import cocoaLogo from '../../assets/img/cocoa-logo.png'
import bgImaveWave from '../../components/BecomingABuyer/bgImageWave.png'
import guyImage from '../BecomeAVendor/guyImage.png'

import buyerChat from '../BecomingABuyer/buyerChat.png'

import { useState } from 'react'

import { useNavigate } from 'react-router-dom'
const LandingPage = () => {
    const navigate = useNavigate()
    const [activeDropdown, setActiveDropdown] = useState(null)

    const toggleDropdown = (type) => {
        setActiveDropdown((prev) => (prev === type ? null : type))
    }

    return (
        <>
            {/* Laptop Layout */}
            <section className="relative bg-[#d9cffb] min-h-[900px] w-full hidden lg:block overflow-hidden">
                {/* Navigation */}
                <nav className="flex justify-between items-center px-16 py-10 w-full absolute top-0 left-0 z-50 bg-transparent">
                    <div>
                        <a href="/">
                            <img
                                src={cocoaLogo}
                                alt="Cocoa Logo"
                                className="h-20 w-auto"
                            />
                        </a>
                    </div>
                    <div className="flex space-x-12 font-nunito font-extrabold text-[24px] text-buttonBg">
                        {/* Dropdowns */}
                        {[
                            {
                                label: 'Vendors',
                                type: 'vendors',
                                items: [
                                    {
                                        label: 'Becoming a Vendor',
                                        path: '/become-a-vendor',
                                    },
                                    // {
                                    //     label: "Vendor's Blog",
                                    //     path: '/vendors-blog',
                                    // },
                                    // { label: 'Prices', path: '/vendor-prices' },
                                ],
                            },
                            {
                                label: 'Buyers',
                                type: 'buyers',
                                items: [
                                    {
                                        label: 'Becoming a Buyer',
                                        path: '/become-a-buyer',
                                    },
                                    // {
                                    //     label: "Buyer's Blog",
                                    //     path: '/buyers-blog',
                                    // },
                                ],
                            },
                            {
                                label: 'Marketplace',
                                type: 'marketplace',
                                items: [
                                    {
                                        label: 'Corporate Solutions',
                                        path: '/corporate-solutions',
                                    },
                                    {
                                        label: 'SaaS & ERP Services',
                                        path: '/saas-erp',
                                    },
                                    {
                                        label: 'Commercial Equipment',
                                        path: '/commerical-equipment',
                                    },
                                    {
                                        label: 'F&B Suppliers',
                                        path: '/f-b-suppliers',
                                    },
                                ],
                            },
                        ].map(({ label, type, items }) => (
                            <div key={type} className="relative group">
                                <button
                                    className="text-buttonBg px-4 py-0 relative group-hover:text-buttonBg transition-all duration-300 ease-in-out"
                                    onClick={() => toggleDropdown(type)}
                                >
                                    {label}{' '}
                                    <span className="ml-1">&#9662;</span>
                                </button>

                                <div
                                    className={`${
                                        activeDropdown === type
                                            ? 'opacity-100 visible scale-100 translate-y-0'
                                            : 'opacity-0 invisible scale-95 -translate-y-2'
                                    } absolute left-0 mt-2  rounded-md transition-all duration-200 ease-in-out w-56 z-50`}
                                >
                                    {items.map((item, idx) => (
                                        <button
                                            key={idx}
                                            className="block w-full text-left px-6 py-1 text-[16px] text-buttonBg hover:text-white hover:bg-buttonBg transition-colors"
                                            onClick={() => {
                                                navigate(item.path)
                                                setActiveDropdown(null)
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Get Started */}
                        <button
                            className="bg-buttonBg text-white font-nunito text-[22px] px-5 py-2 rounded-full hover:bg-purple-600 transition-all duration-300"
                            onClick={() => navigate('/login')}
                        >
                            Get Started
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex w-full min-h-screen items-center">
                    <div className="w-1/2 pt-16 pl-28">
                        <h1 className="font-nunito text-[60px] font-bold leading-[75px] text-left text-buttonBg">
                            Becoming a Buyer <br />
                        </h1>
                        <div className="font-sourceSans">
                            <h3 className="mt-4 text-[20px] text-buttonBg leading-relaxed font-bold">
                                Streamline Your RFQ Process with Real-Time Chat
                            </h3>
                            <p className="mt-4 text-[22px] text-buttonBg leading-relaxed">
                                Connect instantly with verified suppliers,
                                compare offerings, negotiate in real-time, and
                                generate purchase orders—all through one unified
                                chat platform.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                            <button
                                className="bg-buttonBg text-white font-nunito rounded-full px-10 py-4"
                                onClick={() =>
                                    window.open(
                                        'https://www.linkedin.com/company/cocoa-app/posts/?feedView=all',
                                        '_blank',
                                        'noopener,noreferrer'
                                    )
                                }
                            >
                                Learn More
                            </button>
                        </div>
                    </div>

                    <div className="w-1/2 flex items-end justify-end pt-40 pr-0">
                        <img
                            src={buyerChat}
                            alt="Buyer Chat"
                            className="w-[70%] lg:w-[80%] xl:w-[85%] max-w-none h-auto object-contain translate-x-[5%] xl:translate-x-[5%]"
                            style={{ transform: 'translateY(110px)' }}
                        />
                    </div>
                </div>

                {/* Wave SVG */}
                <svg
                    className="absolute bottom-0 left-0 w-full h-auto pointer-events-none"
                    viewBox="0 0 1440 320"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        d="M0,160 C360,320 720,0 1080,160 C1260,240 1440,160 1440,160 L1440,320 L0,320 Z"
                    />
                </svg>
            </section>
        </>
    )
}

export default LandingPage