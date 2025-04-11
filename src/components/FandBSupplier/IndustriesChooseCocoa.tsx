import React from 'react'
import { FiMessageSquare, FiLink } from 'react-icons/fi'
import imageOne from '../CorporateSolutions/imageOne.png'
import imageTwo from '../CorporateSolutions/imageTwo.png'
import imageThree from '../CorporateSolutions/imageThree.png'
import imageFour from '../CorporateSolutions/imageFour.png'

const IndustriesChooseCocoa: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-24 overflow-x-hidden max-w-full">
            <h2 className="text-5xl font-bold text-center mb-24 font-sans">
                Why different industry leaders
                <br />
                choose <span className="text-[#6B5BA9] font-sans">COCOA</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* First Row */}
                <div className="space-y-6">
                    <h2 className="text-3xl text-[#6B5BA9] font-bold font-sans">
                        Verified Partner Network
                    </h2>
                    <p className="text-gray-600 text-lg font-nutito">
                        Connect with pre-qualified buyers and suppliers you can
                        trust.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed font-nunito">
                        We use a multi-step verification process to ensure all
                        partners meet high standards. You can track supplier
                        performance in real time, including ratings and delivery
                        times, all in one dashboard. The system matches you with
                        verified partners based on your industry and needs.
                        Plus, it offers access to partners across Canada with
                        tools that make cross-border transactions easy.
                    </p>
                </div>

                <div className="relative flex items-center justify-center">
                    {/* Background Circle */}
                    <div className="w-[400px] h-[400px] bg-[#F4F2FF] rounded-full absolute"></div>

                    {/* Image Two (Back Card) - Set a higher z-index */}
                    <img
                        src={imageTwo}
                        alt="Potential Vendors"
                        className="absolute bottom-12 right-[-20px] w-[340px]  rounded-2xl z-20"
                    />

                    {/* Image One (Front Card, Slightly Overlapping) - Lower z-index */}
                    <img
                        src={imageOne}
                        alt="Potential Buyers"
                        className="absolute top-[-20px] left-[-20px] w-[360px] z-10"
                    />
                </div>

                <div className="relative flex items-center justify-center">
                    {/* Background Circle */}
                    <div className="absolute w-[400px] h-[400px] bg-[#F4F2FF] rounded-full"></div>

                    {/* Image Three on top of the circle */}
                    <img
                        src={imageThree}
                        alt="Chat Interface"
                        className="relative w-[350px] h-auto object-cover rounded-2xl"
                    />
                </div>

                {/* Second Row */}
                <div className="space-y-6">
                    <h2 className="text-3xl text-[#6B5BA9] font-semibold flex items-center gap-3 font-sans">
                        <FiMessageSquare className="w-8 h-8" />
                        Chat-Based Deal Room
                    </h2>
                    <p className="text-gray-600 text-lg font-nunito">
                        Transform your procurement process with instant
                        communication and deal closure.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        Real-time chat allows you to close deals faster through
                        instant negotiations between buyers and suppliers. You
                        can share and receive quotes, specs, and contracts
                        directly in the chat. Plus, you can generate and approve
                        purchase orders (POs) with one click. All conversations
                        and agreements are automatically saved for easy
                        reference.
                    </p>
                </div>

                {/* Third Row */}
                <div className="space-y-6">
                    <h2 className="text-3xl text-[#6B5BA9] font-semibold flex items-center gap-3 font-sans">
                        <FiLink className="w-8 h-8" />
                        Seamless Integration Hub
                    </h2>
                    <p className="text-gray-600 text-lg font-nunito">
                        Connect COCOA with your existing systems for streamlined
                        operations.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed font-nunito">
                        The system comes with plug-and-play ERP platform
                        integrations for seamless workflows with custom approval
                        routes and detailed data that match your processes. You
                        can track performance metrics, generate reports, and
                        automate routine tasks. Finally, it ensures all
                        transactions and communications are protected with
                        strong security.
                    </p>
                </div>

                <div className="relative flex items-center justify-center">
                    {/* Background Circle */}
                    <div className="absolute w-[450px] h-[450px] bg-[#F4F2FF] rounded-full"></div>

                    {/* Image Three on top of the circle */}
                    <img
                        src={imageFour}
                        alt="Chat Interface"
                        className="relative w-[400px] h-auto object-cover rounded-2xl"
                    />
                </div>
            </div>
        </div>
    )
}

export default IndustriesChooseCocoa
