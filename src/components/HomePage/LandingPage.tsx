import bgWave from '../../assets/img/MainSection/bgWave.png'
import bgWaveUpdated from '../../assets/img/MainSection/bgWaveUpdated.png'
import bgWaveNew from '../../assets/img/MainSection/bgWaveNew.png'
import cocoaLogo from '../../assets/img/cocoa-logo.png'
import { useNavigate } from 'react-router-dom'
import laptopImage from '../../assets/img/MainSection/laptop.png'
import dashboard from '../../components/HomePage/Dashboard.png'
import { useState } from 'react'

// For Mobile Responsiveness
import laptopImageMobile from '../../assets/img/MainSection/laptopImgMobile.png'
import bgWaveMobile from '../../assets/img/MainSection/bgWaveMobile.png'

const LandingPage = () => {
    const navigate = useNavigate() // Hook for navigation
    const [activeDropdown, setActiveDropdown] = useState(null)

    const toggleDropdown = (type) => {
        setActiveDropdown((prev) => (prev === type ? null : type))
    }

    return (
        <>
            {/* Laptop Layout */}
            <section
                className="relative bg-white w-full hidden lg:block pb-[160px]"
                style={{
                    backgroundImage: `url(${bgWaveNew})`,
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'bottom',
                }}
            >
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
                    <div className="flex space-x-12 font-nunito font-extrabold text-[22px] text-buttonBg">
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
                                    { label: 'Prices', path: '/vendor-prices' },
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
                                            className="block w-full text-left px-6 py-1 text-sm text-buttonBg hover:text-white hover:bg-buttonBg transition-colors"
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

                <div className="flex w-full max-w-[1440px] mx-auto min-h-screen items-center">
                    <div className="w-1/2 pt-44 pl-28">
                        <h1 className="font-nunito text-[45px] font-bold leading-tight text-left text-buttonBg whitespace-nowrap">
                            Real-Time Global B2B Procurement Through Chat
                        </h1>

                        <div className="font-sourceSans">
                            <p className="mt-4 text-[18px] text-black leading-relaxed">
                                Transform your procurement process with
                                COCOA—the first chat-based procurement
                                marketplace that connects you directly with
                                verified vendors and buyers in real-time.
                            </p>

                            <p className="mt-4 text-[18px] text-black leading-relaxed">
                                From corporate services to SaaS & IT solutions,
                                we eliminate fragmented communication and
                                lengthy RFPs, helping you make faster decisions
                                with qualified partners.
                            </p>
                            <p className="mt-6 text-[18px] font-bold text-black">
                                Welcome to COCOA, where procurement meets real
                                conversation. Find & connect with verified
                                suppliers in one unified platform.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                            <button
                                className="bg-buttonBg text-white font-nunito rounded-full px-10 py-4"
                                onClick={() => navigate('/login')}
                            >
                                START NOW
                            </button>
                            {/* <a
                                href="#demo"
                                className="pt-3 text-black underline"
                            >
                                Want a free demo?
                            </a> */}
                        </div>
                    </div>

                    <div className="w-1/2 flex items-center justify-end pt-24 pr-12">
                        <img
                            src={dashboard}
                            alt="Laptop Display"
                            className="w-[700px] h-auto xl:w-[800px] xl:h-auto 2xl:w-[900px] mt-28"
                        />
                    </div>
                </div>
                <div className="absolute bottom-[-9px] left-0 w-full h-[10px] bg-white z-10" />
            </section>

            {/* Mobile Layout */}
            <section
                className="relative bg-cover bg-no-repeat w-full lg:hidden min-h-screen"
                style={{
                    backgroundImage: `url(${bgWaveMobile})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'bottom center',
                }}
            >
                {/* Mobile Navigation Menu */}
                <nav className="absolute top-4 left-0 right-0 flex justify-center items-center px-6 py-4 z-10">
                    <div>
                        <a href="/">
                            <img
                                src={cocoaLogo}
                                alt="Cocoa Logo"
                                className="h-18 w-auto"
                            />
                        </a>
                    </div>
                </nav>

                {/* Mobile Layout Content */}
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] pt-28">
                    <h1 className="font-nunito text-[40px] font-bold text-buttonBg text-left px-12">
                        Real-Time Global Procurement Through Chat
                    </h1>
                    <div className="mt-0">
                        <img
                            src={laptopImageMobile}
                            alt="Mobile Laptop Display"
                            className="mx-auto h-auto w-auto"
                        />
                    </div>
                    <div className="font-sourceSans mt-0 text-[16px] text-buttonBg text-left px-4">
                        <p className="leading-relaxed">
                            From enterprise-level corporate services and leading
                            ERP solutions (including NetSuite, SAP S/4HANA,
                            Oracle) to commercial equipment and food & beverage
                            procurement, COCOA revolutionizes B2B purchasing by
                            providing real-time communication with trusted
                            suppliers in one integrated platform.
                        </p>
                    </div>
                    <div className="font-sourceSans mt-4 text-[16px] font-bold text-buttonBg text-left px-4">
                        <p>
                            Welcome to COCOA, your comprehensive procurement
                            marketplace connecting businesses with verified
                            suppliers through instant chat communication.
                        </p>
                    </div>
                    <div className="mt-8">
                        <button
                            className="bg-buttonBg text-white font-nunito rounded-full px-6 py-2 "
                            onClick={() => navigate('/login')}
                        >
                            START NOW
                        </button>
                        <a
                            href="#demo"
                            className="pt-3 text-black underline px-5"
                        >
                            Want a free demo?
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LandingPage
