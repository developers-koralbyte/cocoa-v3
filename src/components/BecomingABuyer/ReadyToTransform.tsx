import React from 'react'
import { HiUserGroup } from 'react-icons/hi'
import { HiCreditCard, HiRocketLaunch } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'

const features = [
    {
        icon: <HiUserGroup className="w-5 h-5" />,
        text: 'Instant Supplier Matching',
    },
    {
        icon: <HiCreditCard className="w-5 h-5" />,
        text: 'No credit card required',
    },
    {
        icon: <HiRocketLaunch className="w-5 h-5" />,
        text: 'Quick Set up',
    },
]

const ReadyToTransform = () => {
    const navigate = useNavigate()
    return (
        <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex">
                        {/* Left side - Image */}
                        <div className="w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1524749292158-7540c2494485?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Team working on procurement"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Right side - Content */}
                        <div className="w-1/2 p-12">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Ready to Transform Your Procurement Process?
                            </h2>

                            <p className="text-lg text-gray-600 font-semibold mb-8">
                                Integration Capabilities
                            </p>

                            <div className="space-y-6 mb-10">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="bg-purple-100 p-2 rounded-full">
                                            {feature.icon}
                                        </div>
                                        <span className="text-gray-700">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/create-account')}
                                className="bg-[#5B4B8A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#4A3D6E] transition-colors">
                                Get Started Free
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReadyToTransform
