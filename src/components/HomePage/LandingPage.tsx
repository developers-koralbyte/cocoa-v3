import bgWave from '../../assets/img/MainSection/bgWave.png'
import cocoaLogo from '../../assets/img/cocoa-logo.png'
import { useNavigate } from 'react-router-dom'
import laptopImage from '../../assets/img/MainSection/laptop.png'

const LandingPage = () => {
    const navigate = useNavigate() // Hook for navigation

    return (
        <>
            <section
                className="relative bg-cover bg-no-repeat min-h-[1200px] w-full"
                style={{
                    backgroundImage: `url(${bgWave})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'bottom center',
                }}
            >
                {/* ✅ FIX: Navbar Full Width */}
                <nav className="flex justify-between items-center px-16 py-10 w-full absolute top-0 left-0">
                    {/* Logo Section */}
                    <div>
                        <a href="/">
                            <img
                                src={cocoaLogo}
                                alt="Cocoa Logo"
                                className="h-20 w-auto"
                            />
                        </a>
                    </div>
                    {/* Navigation Links */}
                    <div className="font-nunito flex space-x-12 font-nunito font-extrabold text-[22px]">
                        <button
                            className="text-buttonBg px-4 py-2"
                            onClick={() => navigate('/create-account')}
                        >
                            Vendors <span className="ml-1">&#9662;</span>
                        </button>
                        <button
                            className="text-buttonBg px-4 py-2"
                            onClick={() => navigate('/create-account')}
                        >
                            Buyers <span className="ml-1">&#9662;</span>
                        </button>
                        <button className="text-buttonBg px-4 py-2">
                            Marketplace <span className="ml-1">&#9662;</span>
                        </button>
                        <button
                            className="bg-buttonBg text-white font-nunito text-[22px] px-5 py-2 rounded-full hover:text-white transition-colors duration-200"
                            onClick={() => navigate('/login')}
                        >
                            Get Started
                        </button>
                    </div>
                </nav>

                {/* ✅ Layout Fix: Flex for Text & Image */}
                <div className="flex w-full min-h-screen items-center">
                    {/* Left Section */}
                    <div className="w-1/2 pt-56 pl-28">
                        <h1 className="font-nunito text-[60px] font-bold leading-[75px] text-left text-buttonBg">
                            Real-Time Global <br /> Procurement <br /> Through
                            Chat
                        </h1>
                        <div className="font-sourceSans">
                            <p className="mt-4 text-[18px] text-buttonBg leading-relaxed">
                                From enterprise-level corporate services and
                                leading ERP solutions
                                <br />
                                (including NetSuite, SAP S/4HANA, Oracle) to
                                commercial equipment <br />
                                and food & beverage procurement, COCOA
                                revolutionizes B2B <br /> purchasing by
                                providing real-time communication with trusted{' '}
                                <br />
                                suppliers in one integrated platform.
                            </p>
                            <p className="mt-6 text-[18px] font-bold text-buttonBg">
                                Welcome to COCOA, your comprehensive procurement
                                marketplace connecting <br />
                                businesses with verified suppliers through
                                instant chat communication.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                            <button className="bg-buttonBg text-white font-nunito rounded-full px-10 py-4" 
                            onClick={() => navigate('/login')}>
                                START NOW
                            </button>
                            <a
                                href="#demo"
                                className="pt-3 text-black underline"
                            >
                                Want a free demo?
                            </a>
                        </div>
                    </div>

                    {/* Right Section (Laptop Image) */}
                    <div className="w-1/2 flex items-center justify-end pt-56">
                        <img
                            src={laptopImage}
                            alt="Laptop Display"
                            className="h-auto w-auto"
                        />
                    </div>
                </div>
            </section>
        </>
    )
}

export default LandingPage
