import React from 'react'
import {
    IoChatbubbleEllipsesOutline,
    IoDocumentTextOutline,
    IoPeopleOutline,
    IoShieldCheckmarkOutline,
} from 'react-icons/io5'

interface Benefit {
    icon: React.ReactNode
    title: string
    description: string
}

const benefits: Benefit[] = [
    {
        icon: <IoChatbubbleEllipsesOutline size={48} />,
        title: 'CHAT',
        description: 'Instant Chat Communications',
    },
    {
        icon: <IoDocumentTextOutline size={48} />,
        title: 'PO',
        description: 'Automated PO generation',
    },
    {
        icon: <IoPeopleOutline size={48} />,
        title: '500+',
        description: 'Active Buyers',
    },
    {
        icon: <IoShieldCheckmarkOutline size={48} />,
        title: 'SECURE',
        description: 'Payment Processing',
    },
]

const BenefitsOfVerification: React.FC = () => {
    return (
        <>
            <style>
                {`
          @keyframes slideAnimation {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(calc(-100% / 2));
            }
          }

          .benefits-slider {
            display: flex;
            animation: slideAnimation 20s linear infinite;
            width: max-content;
          }

          .benefits-slider:hover {
            animation-play-state: paused;
          }
        `}
            </style>

            <section className="py-16 overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-28">
                        Benefits After Verification
                    </h2>

                    <div className="relative overflow-hidden">
                        <div className="benefits-slider">
                            {/* First set of items */}
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex-none w-64 text-center px-4"
                                >
                                    <div className="flex justify-center mb-4 text-[#6B5BA9]">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-3xl font-bold text-[#6B5BA9] mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}

                            {/* Duplicate set for seamless loop */}
                            {benefits.map((benefit, index) => (
                                <div
                                    key={`duplicate-${index}`}
                                    className="flex-none w-64 text-center px-4"
                                >
                                    <div className="flex justify-center mb-4 text-[#6B5BA9]">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-3xl font-bold text-[#6B5BA9] mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default BenefitsOfVerification
