import cocoaLogo from '../../assets/img/cocoa-logo.png'
import bgImaveWave from '../../components/BecomingABuyer/bgImageWave.png'
import guyImage from '../BecomeAVendor/guyImage.png'

import buyerChat from '../BecomingABuyer/buyerChat.png'

import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
    const navigate = useNavigate() // Hook for navigation
    return (
        <>
            {/* Laptop Layout */}
            <section
                className="relative bg-cover bg-no-repeat min-h-[900px] w-full hidden lg:block"
                style={{
                    backgroundImage: `url(${bgImaveWave})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'bottom center',
                }}
            >
                <nav className="flex justify-between items-center px-16 py-10 w-full absolute top-0 left-0">
                    <div>
                        <a href="/">
                            <img
                                src={cocoaLogo}
                                alt="Cocoa Logo"
                                className="h-20 w-auto"
                            />
                        </a>
                    </div>
                    <div className="font-nunito flex space-x-12 font-extrabold text-[22px]">
                        <button
                            className="text-buttonBg px-4 py-2"
                            onClick={() => navigate('/become-a-vendor')}
                        >
                            Vendors <span className="ml-1">&#9662;</span>
                        </button>
                        <button
                            className="text-buttonBg px-4 py-2"
                            onClick={() => navigate('/create')}
                        >
                            Buyers <span className="ml-1">&#9662;</span>
                        </button>
                        <button
                            className="text-buttonBg px-4 py-2"
                            onClick={() => navigate('/marketplace')}
                        >
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

                <div className="flex w-full min-h-screen items-center">
                    <div className="w-1/2 pt-48 pl-28">
                        <h1 className="font-nunito text-[60px] font-bold leading-[75px] text-left text-buttonBg">
                            Becoming a Buyer <br />
                        </h1>
                        <div className="font-sourceSans">
                            <h3 className="mt-4 text-[18px] text-buttonBg leading-relaxed font-bold">
                                Streamline Your RFQ Process <br /> with
                                Real-Time Chat
                            </h3>
                            <p className="mt-4 text-[18px] text-buttonBg leading-relaxed ">
                                Connect instantly with verified suppliers,{' '}
                                <br />
                                negotiate in real-time, and generate purchase{' '}
                                <br />
                                orders-all through one chat platform. <br />
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                            <button
                                className="bg-buttonBg text-white font-nunito rounded-full px-10 py-4"
                                onClick={() => navigate('/login')}
                            >
                                Learn More
                            </button>
                        </div>
                    </div>

                    <div className="w-1/2 flex items-center justify-start pt-40">
                        <img
                            src={buyerChat}
                            alt="Buyer Chat"
                            className="h-[550px] w-[100%] max-w-full object-contain relative left-24"
                            style={{ transform: 'translateY(206px)' }} // Move the image down by 50px
                        />
                    </div>
                </div>
            </section>
        </>
    )
}

export default LandingPage
