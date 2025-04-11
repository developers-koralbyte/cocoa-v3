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
                        From ingredient sourcing to inventory management, our
                        platform streamlines your entire procurement process.
                        Connect instantly with verified suppliers, manage
                        quality standards, and optimize costs through our
                        intelligent matching system.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-20">
                    {/* First Row */}
                    <div className="bg-[#B4EDE8] rounded-2xl p-3 aspect-[1.25] flex flex-col justify-end">
                        <h3 className="text-xl font-semibold text-[#2A4365] mb-2">
                            Inventory Intelligence
                        </h3>
                        <div className="space-y-1 text-sm text-[#2A4365]/80">
                            <p>Real-time stock tracking</p>
                            <p>Automated reordering</p>
                            <p>Smart demand forecasting</p>
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
                            Quality Controller
                        </h3>
                        <div className="space-y-1 text-sm text-white/90">
                            <p>Supplier quality tracking</p>
                            <p>Compliance monitoring</p>
                            <p>Certificate management</p>
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
                            Price Optimizer
                        </h3>
                        <div className="space-y-1 text-sm text-[#2A4365]/80">
                            <p>Real time market price comparison</p>
                            <p>Bulk purchase planning</p>
                            <p>Seasonal pricing alerts</p>
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
