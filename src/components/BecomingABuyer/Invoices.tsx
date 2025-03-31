import React from 'react'
import invoicesImg from '../BecomingABuyer/invoicesImg.png'
import {
    HiClipboardDocument,
    HiChatBubbleLeftRight,
    HiDocument,
    HiChartBar,
} from 'react-icons/hi2'

const features = [
    {
        icon: <HiClipboardDocument className="w-8 h-8" />,
        title: 'RFQ Management',
        description:
            'Track all your RFQs in one place and monitor responses and deadlines effortlessly.',
        subFeatures: ['Multi-vendor comparison', 'Response tracking'],
    },
    {
        icon: <HiChatBubbleLeftRight className="w-8 h-8" />,
        title: 'Real-Time Chat',
        description:
            'Negotiate with suppliers instantly. Share files and specifications in real-time.',
        subFeatures: ['Instant Messaging', 'Quote management'],
    },
    {
        icon: <HiDocument className="w-8 h-8" />,
        title: 'Documentation',
        description: 'Generate and manage procurement documents automatically.',
        subFeatures: [
            'Auto PO generation and Audit Trails',
            'Access to document history',
        ],
    },
    {
        icon: <HiChartBar className="w-8 h-8" />,
        title: 'Analytics',
        description: 'Track procurement metrics and suppliers performance.',
        subFeatures: ['Supplier ratings', 'Response times and cost analysis'],
    },
]

const Invoices = () => {
    return (
        <div className="bg-gray-50 py-24 relative">
            <div className="max-w-7xl mx-auto px-8 relative">
                {/* Image Positioned in the Center (Bigger & Higher) */}
                <div className="absolute top-[-20%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 " >
                    <img
                        src={invoicesImg}
                        alt="Invoices"
                        className="w-[350px] lg:w-[600px] opacity-90"
                    />
                </div>

                {/* Features Section */}
                <div className="bg-[#5F4B8B]/5 py-16 rounded-2xl relative z-0 mt-56">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Our Procurement{' '}
                            <span className="text-[#5F4B8B]">Features</span>{' '}
                            that make COCOA different!
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-8 px-12 relative">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                <div className="text-[#5F4B8B] mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-[#5F4B8B] font-semibold mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {feature.description}
                                </p>
                                <div className="space-y-2">
                                    {feature.subFeatures.map(
                                        (subFeature, idx) => (
                                            <p
                                                key={idx}
                                                className="text-xs text-gray-500"
                                            >
                                                {subFeature}
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invoices
