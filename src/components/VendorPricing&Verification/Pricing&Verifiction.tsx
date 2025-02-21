import React from 'react'
import { BsCheckCircle } from 'react-icons/bs'

interface PricingCardProps {
    price: string
    planType: string
    features: string[]
    buttonText: string
    isHighlighted?: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({
    price,
    features,
    buttonText,
    isHighlighted = false,
    planType,
}) => {
    return (
        <div
            className={`rounded-3xl p-8 transition-all duration-300 ease-in-out transform hover:scale-105 relative ${
                isHighlighted
                    ? 'bg-[#6B5BA9] text-white shadow-xl'
                    : 'bg-white shadow-lg'
            }`}
        >
            <div className="space-y-6">
                <div>
                    <span
                        className={`text-4xl font-bold ${isHighlighted ? 'text-white' : 'text-[#6B5BA9]'}`}
                    >
                        {price}
                    </span>
                    <div className="mt-2">
                        <span
                            className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                                isHighlighted
                                    ? 'bg-white text-[#6B5BA9]'
                                    : 'bg-[#F3F4FF] text-[#6B5BA9]'
                            }`}
                        >
                            {planType}
                        </span>
                    </div>
                </div>

                <div className="pt-4">
                    <p
                        className={`font-semibold mb-4 ${isHighlighted ? 'text-white' : 'text-gray-800'}`}
                    >
                        Features
                    </p>
                    <ul className="space-y-4">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <BsCheckCircle
                                    className={`flex-shrink-0 mt-1 ${
                                        isHighlighted
                                            ? 'text-white'
                                            : 'text-[#6B5BA9]'
                                    }`}
                                />
                                <span
                                    className={`text-sm ${isHighlighted ? 'text-white' : 'text-gray-600'}`}
                                >
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                        isHighlighted
                            ? 'bg-white text-[#6B5BA9] hover:bg-gray-100'
                            : 'bg-[#6B5BA9] text-white hover:bg-[#5D4C7C]'
                    }`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    )
}

const PricingAndVerification: React.FC = () => {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Background with gradient and wave */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#babadf] to-white">
                <svg
                    className="absolute bottom-0 left-0 w-full"
                    viewBox="0 0 1440 320"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-[#6B5BA9] mb-4">
                        Pricing and Verification
                    </h1>
                    <p className="text-[#6B5BA9] text-lg">
                        Affordable Plans, Unlimited Possibilities
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <PricingCard
                        price="Free"
                        planType="Basic Plan"
                        features={[
                            'Only for 1 month',
                            'Enjoy one month of COCOA with full access to current features including automation',
                            'Explore limited access to the Business Directory across Ontario',
                        ]}
                        buttonText="Sign up now"
                    />

                    <PricingCard
                        price="$2990"
                        planType="Premium Plan"
                        features={[
                            'Full access to our Business Directory across Ontario',
                            'Expand your outreach as we continue to onboard more F&B businesses',
                            'Enjoy priority customer support',
                            'Upgrade Option: Get featured as a preferred vendor',
                        ]}
                        buttonText="Sign up now"
                        isHighlighted={true}
                    />

                    <PricingCard
                        price="Contact for pricing"
                        planType="Custom Plan"
                        features={[
                            'Get all the features of the Premium Plan',
                            'API Integration with your existing systems',
                            'Custom customizations to fit your needs',
                            'Dedicated account manager',
                        ]}
                        buttonText="Contact us"
                    />
                </div>
            </div>
        </section>
    )
}

export default PricingAndVerification
