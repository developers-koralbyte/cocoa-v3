import React, { useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

interface FAQItem {
    question: string
    answer: string
}

const faqData: FAQItem[] = [
    {
        question:
            'Can I share technical specifications and documents during chat??',
        answer: 'Yes, you can share technical specifications and documents directly within the chat. Upload files, send detailed requirements, and share specifications securely with potential vendors. All documents remain accessible throughout the procurement process for easy reference.',
    },
    {
        question:
            'How does the AI matching system find relevant suppliers for my RFQs?',
        answer: 'Our AI matching system analyzes your requirements against our database of verified vendors using industry specialization, service categories, previous performance, and capability criteria. The system evaluates vendor expertise, satisfaction ratings, and delivery metrics to identify the best matches. You can refine results using filters for company size, location, and certifications.',
    },
    {
        question: 'What procurement analytics does the platform provide?',
        answer: 'COCOA provides analytics on spending patterns, vendor performance, negotiation outcomes, and time-to-contract metrics. Access dashboards showing cost savings, vendor pricing comparisons, budget tracking, and optimization opportunities. Premium users receive predictive analytics for forecasting future needs and potential cost fluctuations.',
    },
    {
        question:
            'How can I track multiple responses from vendors to my RFQ in real time?',
        answer: 'Track all vendor responses in real time through our centralized dashboard with a comparative view highlighting differences in pricing, timelines, and features. Create custom comparison matrices, flag important points, and maintain structured conversations while viewing all available options. Receive notifications when new responses arrive.',
    },
]
const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="relative py-8 pb-40">
            {' '}
            {/* Added pb-20 for extra bottom space */}
            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <h2 className="text-7xl font-bold text-[#6B5BA9]">FAQ</h2>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="space-y-6">
                        {faqData.map((faq, index) => (
                            <div
                                key={index}
                                className={`border-b border-gray-200 transition-all duration-300 ${
                                    openIndex === index
                                        ? 'bg-white rounded-lg shadow-lg border-none p-6'
                                        : 'p-4'
                                }`}
                            >
                                <button
                                    className="w-full flex justify-between items-center text-left group"
                                    onClick={() => toggleAccordion(index)}
                                    aria-expanded={openIndex === index}
                                    aria-controls={`faq-answer-${index}`}
                                >
                                    <span
                                        className={`text-xl font-medium transition-colors duration-300 ${
                                            openIndex === index
                                                ? 'text-[#5D4C7C]'
                                                : 'text-gray-800 group-hover:text-[#5D4C7C]'
                                        }`}
                                    >
                                        {faq.question}
                                    </span>
                                    <IoIosArrowDown
                                        className={`text-[#5D4C7C] transition-transform duration-300 ${
                                            openIndex === index
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                        size={24}
                                    />
                                </button>
                                <div
                                    id={`faq-answer-${index}`}
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                        openIndex === index
                                            ? 'mt-4 max-h-[200px] opacity-100'
                                            : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQ
