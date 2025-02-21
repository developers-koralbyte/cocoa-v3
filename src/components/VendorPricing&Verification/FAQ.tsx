import React, { useState } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

interface FAQItem {
    question: string
    answer: string
}

const faqData: FAQItem[] = [
    {
        question:
            'How does the AI matching system match vendors with potential buyers?',
        answer: 'Our AI-powered system analyzes multiple factors including industry focus, solution categories, company size, and specific requirements to create optimal matches. The system continuously learns from successful matches to improve accuracy and relevance of connections.',
    },
    {
        question:
            'Is real-time chat available 24/7, and how quickly can I expect responses?',
        answer: 'Yes, our chat platform is available 24/7 for message exchanges. While response times vary based on vendor availability, our system shows active status and typical response times for each vendor. Most vendors respond within 1-2 business hours during standard business hours.',
    },
    {
        question:
            'How does the automatic PO generation work from chat conversations?',
        answer: 'Our smart system identifies key transaction details from your chat conversations and automatically generates professional purchase orders. The system extracts pricing, quantities, specifications, and terms, allowing you to review and approve the PO with a single click while maintaining audit trails.',
    },
    {
        question: "Can this be integrated with my company's ERP system?",
        answer: 'Yes, COCOA offers robust API integration capabilities with major ERP systems. We provide dedicated technical support for custom integrations, ensuring seamless data flow between COCOA and your existing systems while maintaining data security and integrity.',
    },
]

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="relative py-8 pb-40">
            <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                    <h2 className="text-7xl font-bold text-[#6B5BA9] font-sans">FAQ</h2>
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
                                    <p className="text-gray-600 text-lg leading-relaxed font-nunito">
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
