import React from 'react'

const features = [
    {
        title: 'Real-Time Communication',
        description:
            'Get quotes instantly through chat. No more waiting for email responses or playing phone tag.',
    },
    {
        title: 'Verified Suppliers',
        description:
            'Connect with pre-vetted suppliers who meet our strict verification standards.',
    },
    {
        title: 'Automated Documentation',
        description:
            'Generate purchase orders directly from chat conversations with complete audit trails.',
    },
]

const WhyChooseCocoa = () => {
    return (
        <div className="bg-[#5F4B8B] text-white py-24 font-sans">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-2 gap-16">
                    {/* Left side - Title and Image */}
                    <div className="space-y-8">
                        <h2 className="text-5xl font-bold leading-tight" >
                            Why Procurement Teams Choose COCOA?
                        </h2>
                        <div className="rounded-2xl overflow-hidden bg-white">
                            <img
                                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Procurement team collaborating"
                                className="w-full h-[320px] object-cover"
                            />
                        </div>
                    </div>

                    {/* Right side - Features */}
                    <div className="space-y-10 pt-16 mt-24">
                        {features.map((feature, index) => (
                            <div key={index}>
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-white text-opacity-80 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WhyChooseCocoa
