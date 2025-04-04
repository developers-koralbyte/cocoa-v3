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
                        From specification comparison to installation
                        coordination, our platform provides end-to-end
                        visibility and control. Connect with verified equipment
                        suppliers and manage your entire procurement process
                        through one unified platform.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-20">
                    {/* First Row */}
                    <div className="bg-[#B4EDE8] rounded-2xl p-3 aspect-[1.25] flex flex-col justify-end">
                        <h3 className="text-xl font-semibold text-[#2A4365] mb-2">
                            Equipment Matchmaker
                        </h3>
                        <div className="space-y-1 text-sm text-[#2A4365]/80">
                            <p>AI-powered supplier matching</p>
                            <p>Detailed specification comparison</p>
                            <p>Automated quote collection</p>
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
                            Project Command Centre
                        </h3>
                        <div className="space-y-1 text-sm text-white/90">
                            <p>Real-time delivery tracking</p>
                            <p>Installation scheduling</p>
                            <p>Maintenance planinng integration</p>
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
                            Cost Control Hub
                        </h3>
                        <div className="space-y-1 text-sm text-[#2A4365]/80">
                            <p>Budget tracking and alerts</p>
                            <p>Payment milestone management</p>
                            <p>Expense monitoring dashboard</p>
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
