import React from 'react'
import creditCard from '../CorporateSolutions/creditcardImg.jpg'

const DigitalInnovation: React.FC = () => {
    return (
        <div className="py-20 bg-white relative">
            <div className="container mx-auto px-32">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6">
                        Digital Innovation Features
                    </h1>
                    <p className="text-[#6B5BA9] max-w-3xl mx-auto">
                        COCOA connects you directly with verified SaaS vendors
                        and IT solution providers, enabling smarter decisions
                        through real-time communication and AI-powered matching.
                        From ERP implementations to cloud solutions, find and
                        collaborate with the right partners instantly.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-20">
                    {/* First Row */}
                    <div className="bg-[#B4EDE8] rounded-2xl p-3 aspect-[1.25] flex flex-col justify-end">
                        <h3 className="text-xl font-semibold text-[#2A4365] mb-2">
                            Smart Solution Discovery
                        </h3>
                        <div className="space-y-1 text-sm text-[#2A4365]/80">
                            <p>AI-Powered vendor matching</p>
                            <p>Real-time chat for solution comparison</p>
                            <p>
                                Instant quote Generation from multiple providers
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden aspect-[1.25]">
                        <img
                            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Connect"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="bg-[#9F7AEA] rounded-2xl p-3 aspect-[1.25] flex flex-col justify-end">
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Implementation Tracker
                        </h3>
                        <div className="space-y-1 text-sm text-white/90">
                            <p>Track project milesontes in real-time</p>
                            <p>Collaborate with vendors through unified chat</p>
                            <p>Discover potential buyers more efficiently</p>
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="rounded-2xl overflow-hidden aspect-[1.25] bg-[#008080]">
                        <img
                            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Professional"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="bg-[#D6BCFA] rounded-2xl p-3 aspect-[1.25] flex flex-col justify-end">
                        <h3 className="text-xl font-semibold text-[#2A4365] mb-2">
                            Integration Hub
                        </h3>
                        <div className="space-y-1 text-sm text-[#2A4365]/80">
                            <p>Verify match compatibility instantly</p>
                            <p>Manage API connections seamlessly</p>
                            <p>Track data migration progress</p>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden aspect-[1.25]">
                        <img
                            src={creditCard}
                            alt="Credit Card"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Curve */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 200"
                    className="w-full"
                    preserveAspectRatio="none"
                    style={{ height: '120px' }}
                >
                    <path
                        fill="#6B5BA9"
                        d="M0,60L60,74C120,88,240,116,360,128C480,140,600,128,720,103.5C840,79,960,51,1080,64C1200,77,1320,124,1380,142L1440,160L1440,200L1380,200C1320,200,1200,200,1080,200C960,200,840,200,720,200C600,200,480,200,360,200C240,200,120,200,60,200L0,200Z"
                    />
                </svg>
            </div>
        </div>
    )
}

export default DigitalInnovation
