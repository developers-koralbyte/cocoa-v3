import React from 'react'
import { FiZap, FiHome, FiGrid } from 'react-icons/fi'

const OurUniqueValues: React.FC = () => {
    return (
        <div className="relative">
            {/* Main content */}
            <div className="relative bg-[#6B5BA9] pt-20 pb-20">
                {' '}
                {/* Added padding-top and padding-bottom */}
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Left side - Image */}
                        <div className="relative w-full md:w-1/2 -mb-20 z-10">
                            {/* <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Professional woman"
                                className="w-full max-w-2xl"
                            /> */}
                        </div>

                        {/* Right side - Content */}
                        <div className="w-full md:w-1/2 text-white py-20 md:pl-12">
                            <h2 className="text-5xl font-bold mb-10">
                                Our Unique Values
                            </h2>

                            <div className="space-y-10">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <FiZap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Faster Time-to-Value
                                        </h3>
                                        <div className="space-y-1 text-sm text-white/90">
                                            <p>
                                                Reduce vendor evaluation time.
                                            </p>
                                            <p>
                                                Accelerate implementation
                                                kickoff.
                                            </p>
                                            <p>
                                                Streamline negotiation through
                                                real-time chat.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <FiHome className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Risk Mitigation
                                        </h3>
                                        <div className="space-y-1 text-sm text-white/90">
                                            <p>
                                                Access only to verified
                                                implementation partners.
                                            </p>
                                            <p>
                                                Track vendor performance
                                                metrics.
                                            </p>
                                            <p>
                                                Maintain complet documentation
                                                trail.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        <FiGrid className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Quality Assurance
                                        </h3>
                                        <div className="space-y-1 text-sm text-white/90">
                                            <p>
                                                Verified implementation
                                                partners.
                                            </p>
                                            <p>Standardized quality checks.</p>
                                            <p>Continuous monitoring.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom curve */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 200"
                    className="w-full"
                    preserveAspectRatio="none"
                    style={{ height: '120px' }}
                >
                    <path
                        fill="white"
                        d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,26.7C1200,32,1320,64,1380,80L1440,96L1440,200L1380,200C1320,200,1200,200,1080,200C960,200,840,200,720,200C600,200,480,200,360,200C240,200,120,200,60,200L0,200Z"
                    />
                </svg>
            </div>
        </div>
    )
}

export default OurUniqueValues
