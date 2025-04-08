import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import cocoaLogo from '../../assets/img/cocoa-logo.png'
import cocoaLogoWhite from '../../assets/img/cocoa-logo-white.png'

const LandingPage: React.FC = () => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const navigate = useNavigate()

    const toggleDropdown = (menu: string) => {
        setActiveDropdown(activeDropdown === menu ? null : menu)
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <nav className="flex justify-between items-center px-16 py-10 w-full absolute top-0 left-0 z-50 bg-transparent">
                <div>
                    <a href="/">
                        <img
                            src={cocoaLogoWhite}
                            alt="Cocoa Logo"
                            className="h-20 w-auto"
                        />
                    </a>
                </div>
                <div className="flex space-x-12 font-nunito font-extrabold text-[22px] text-white">
                    {/* Vendors Dropdown */}
                    <div className="relative group">
                        <button
                            className="text-white px-4 py-2 relative group-hover:text-purple-300 transition-all duration-300 ease-in-out"
                            onClick={() => toggleDropdown('vendors')}
                        >
                            Vendors <span className="ml-1">&#9662;</span>
                        </button>
                        <div
                            className={`${
                                activeDropdown === 'vendors'
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-95'
                            } absolute left-0 w-48 bg-white shadow-[0_0_20px_rgba(128,0,128,0.5)] rounded-md transition-all duration-300 ease-in-out transform`}
                        >
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/become-a-vendor')}
                            >
                                Becoming a Vendor
                            </button>
                            {/* <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/')}
                            >
                                Vendor's Blog
                            </button> */}
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/vendor-prices')}
                            >
                                Prices
                            </button>
                        </div>
                    </div>

                    {/* Buyers Dropdown */}
                    <div className="relative group">
                        <button
                            className="text-white px-4 py-2 relative group-hover:text-purple-300 transition-all duration-300 ease-in-out"
                            onClick={() => toggleDropdown('buyers')}
                        >
                            Buyers <span className="ml-1">&#9662;</span>
                        </button>
                        <div
                            className={`${
                                activeDropdown === 'buyers'
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-95'
                            } absolute left-0 w-48 bg-white shadow-[0_0_20px_rgba(128,0,128,0.5)] rounded-md transition-all duration-300 ease-in-out transform`}
                        >
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/become-a-buyer')}
                            >
                                Becoming a Buyer
                            </button>
                            {/* <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/')}
                            >
                                Buyer's Blog
                            </button> */}
                        </div>
                    </div>

                    {/* Marketplace Dropdown */}
                    <div className="relative group">
                        <button
                            className="text-white px-4 py-0 relative group-hover:text-purple-300 transition-all duration-300 ease-in-out"
                            onClick={() => toggleDropdown('marketplace')}
                        >
                            Marketplace <span className="ml-1">&#9662;</span>
                        </button>
                        <div
                            className={`${
                                activeDropdown === 'marketplace'
                                    ? 'opacity-100 scale-100'
                                    : 'opacity-0 scale-95'
                            } absolute left-0 w-80 bg-white shadow-[0_0_20px_rgba(128,0,128,0.5)] rounded-md transition-all duration-300 ease-in-out transform`}
                        >
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/corporate-solutions')}
                            >
                                Corporate Solutions
                            </button>
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/saas-erp')}
                            >
                                SaaS & ERP Services
                            </button>
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() =>
                                    navigate('/commerical-equipment')
                                }
                            >
                                Commercial Equipment & Renovations
                            </button>
                            <button
                                className="w-full text-left px-6 py-3 text-sm text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                                onClick={() => navigate('/f-b-suppliers')}
                            >
                                F&B Suppliers
                            </button>
                        </div>
                    </div>

                    {/* Get Started Button */}
                    <button
                        className="bg-white text-purple-800 font-nunito text-[22px] px-5 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                        onClick={() => navigate('/login')}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Background Image with overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 to-blue-900/60" />
            </div>

            {/* Wave Overlay */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 320"
                    className="w-full h-auto"
                    preserveAspectRatio="none"
                    style={{ transform: 'scale(1.5) translateY(15%)' }}
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,192L80,165.3C160,139,320,85,480,90.7C640,96,800,160,960,176C1120,192,1280,160,1360,144L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
                    />
                </svg>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-20">
                <div className="max-w-4xl mx-auto">
                    <h1
                        className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg font-nunito"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                    >
                        SaaS & ERP Solutions
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-nunito">
                        Transform your software procurement into a seamless
                        <br />
                        digital experience.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
