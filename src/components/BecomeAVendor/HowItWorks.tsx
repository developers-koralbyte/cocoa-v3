import cocoaimg from './cocoa-image.png'
import React from 'react'
import { BsChatDots } from 'react-icons/bs'
import { MdOutlineMessage, MdGroups, MdAttachMoney } from 'react-icons/md'

const HowItWorks = () => {
    const steps = [
        {
            icon: <MdOutlineMessage className="w-12 h-12 text-white" />,
            title: 'Get Matched',
            description:
                'Get instantly matched with buyers looking for your solutions',
            label: 'AI powered',
        },
        {
            icon: <MdGroups className="w-12 h-12 text-white" />,
            title: 'Chat in Real-Time',
            description: 'Negotiate and close deals through instant chat',
            label: 'Interactive Chat',
        },
        {
            icon: <MdAttachMoney className="w-12 h-12 text-white" />,
            title: 'Close Deals Fast',
            description: 'Convert chats to purchases within minutes',
            label: 'Smart Financing',
        },
    ]

    const stats = [
        {
            text: 'Simple Verification',
            value: '500+',
            label: 'Active buyers',
        },
        {
            text: 'Quick Response to RFQs',
            value: '70%',
            label: 'Faster deal closure rate',
        },
        {
            text: 'Instant PO Generation',
            value: '$XX',
            label: 'Monthly Transaction',
        },
    ]

    return (
        <div className="relative z-10 bg-white -mt-[1px] pt-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-6xl font-bold text-darkPurple font-nunito text-left">
                        How It Works?
                    </h2>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative bg-primaryPurple/20 rounded-2xl p-4 flex flex-col items-start scale-90"
                        >
                            {/* Icon Container */}
                            <div className="bg-darkPurple rounded-xl p-6 mb-3 w-full aspect-square flex items-center justify-center">
                                {step.icon}
                            </div>

                            {/* Text Content */}
                            <div className="mt-2 w-full text-left">
                                {/* Boxed Label */}
                                <p className="text-sm bg-darkPurple text-white px-3 py-1 rounded-md inline-block mb-2 font-nunito">
                                    {step.label}
                                </p>

                                <h3 className="text-lg font-semibold text-darkPurple mb-1 font-nunito">
                                    {step.title}
                                </h3>
                                <p className="text-darkPurple/80 text-xs">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Connect with Buyers Section */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-16">
                    <div className="md:w-1/2">
                        <h2 className="text-[40px] leading-[48px] font-bold text-black mb-3 font-nunito">
                            Connect with Active Buyers Through Real-Time Chat
                        </h2>
                        <p className="text-[#6B5BA9] text-lg font-normal mb-12 font-nunito">
                            Engage, Convert, and Build Relationships Instantly
                            with Live Messaging
                        </p>

                        {/* Stats */}
                        <div className="space-y-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-6 h-6 flex-shrink-0">
                                        <svg
                                            className="w-full h-full text-[#6B5BA9]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            {index === 0 && (
                                                <path
                                                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                                                    fill="currentColor"
                                                />
                                            )}
                                            {index === 1 && (
                                                <path
                                                    d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM16.2 16.2L11 13V7H12.5V12.2L17 14.9L16.2 16.2Z"
                                                    fill="currentColor"
                                                />
                                            )}
                                            {index === 2 && (
                                                <path
                                                    d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                                                    fill="currentColor"
                                                />
                                            )}
                                        </svg>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start w-full justify-between font-nunito">
                                        <p className="text-[#6B5BA9] text-sm font-medium whitespace-nowrap font-nunito">
                                            {stat.text}
                                        </p>
                                        {/* <div className="text-right">
                                            <span className="font-bold text-black text-base font-nunito">
                                                {stat.value}
                                            </span>
                                            <span className="text-black text-base ml-1 font-nunito">
                                                {stat.label}
                                            </span>
                                        </div> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:w-1/3 flex justify-center">
                        <img
                            src={cocoaimg}
                            alt="Cocoa Image"
                            className="w-[280px] h-[280px] rounded-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowItWorks