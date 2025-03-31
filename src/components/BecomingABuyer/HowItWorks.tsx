import React from 'react'
import { HiUsers } from 'react-icons/hi'
import {
    HiDocumentText,
    HiQuestionMarkCircle,
    HiCheckCircle,
} from 'react-icons/hi2'

import imageHIW from '../BecomingABuyer/imageHIW.png'
import imgHIW2 from '../BecomingABuyer/imageHIW2.png'

const steps = [
    {
        icon: <HiUsers className="w-12 h-12" />,
        title: 'Get Matched',
        description: 'Connect with relevant suppliers instantly',
        badge: 'AI powered',
    },
    {
        icon: <HiDocumentText className="w-12 h-12" />,
        title: 'Post RFQ',
        description: 'Submit your requirements in minutes',
        badge: 'AI powered',
    },
    {
        icon: <HiQuestionMarkCircle className="w-12 h-12" />,
        title: 'Chat & Compare',
        description: 'Negotiate with multiple vendors in real-time',
        badge: 'Interactive Chat',
    },
    {
        icon: <HiCheckCircle className="w-12 h-12" />,
        title: 'Place Order',
        description: 'Convert Chat to PO with one click',
        badge: 'Interactive Chat',
    },
]

const HowItWorks = () => {
    return (
        <div className="bg-white py-16 lg:py-20">
            {/* Image Section */}
            <section className="relative w-full hidden lg:flex justify-center items-center mt-10">
                <img
                    src={imageHIW}
                    alt="How It Works"
                    className="max-w-5xl w-full h-auto object-contain mx-auto"
                />
            </section>

            {/* Steps Section */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-28">
                <div className="flex flex-row-reverse justify-between items-start gap-16 lg:gap-24">
                    {/* Title Section */}
                    <div className="w-full lg:w-2/5">
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#5F4B8B] mb-4 mt-32">
                            How It Works?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            From Submission to Order: Streamlined RFQ Process
                            for Quick, Real-Time Transactions
                        </p>
                    </div>

                    {/* Steps Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-lg p-4 relative overflow-hidden min-h-[250px]" // Reduced padding and min-height
                                style={{
                                    boxShadow:
                                        '0px 4px 20px rgba(0, 0, 0, 0.08)',
                                }}
                            >
                                {/* Larger Purple Corner Design */}
                                <div
                                    className="absolute top-0 right-0 w-32 h-32" // Decreased size of purple corner
                                    style={{
                                        background: '#5F4B8B',
                                        borderBottomLeftRadius: '100%',
                                    }}
                                />

                                {/* Step Content */}
                                <h3 className="text-lg font-semibold text-[#5F4B8B] mb-2">
                                    {' '}
                                    {/* Reduced margin */}
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {step.description}
                                </p>

                                {/* Icon */}
                                <div className="absolute top-4 right-4 text-white z-10">
                                    {step.icon}
                                </div>

                                {/* Badge */}
                                <span className="inline-block bg-[#F3F1F7] text-[#5F4B8B] text-xs px-2.5 py-1 rounded-full mb-4 absolute bottom-4 left-4">
                                    {step.badge}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowItWorks
