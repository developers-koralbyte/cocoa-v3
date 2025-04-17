import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
    {
        question: 'What is COCOA?',
        answer: "COCOA is Canada's first chat-based procurement platform connecting enterprises with verified solution providers. Through real-time communication, we streamline procurement across corporate services, enterprise software, commercial equipment, and industry solutions - transforming traditional procurement into an efficient, integrated experience.",
    },
    {
        question: 'Is COCOA a POS?',
        answer: 'No, COCOA is not just a POS. It’s a comprehensive solution that connects buyers with vendors and streamlines the entire supply chain process.',
    },
    {
        question: 'Is COCOA Free for businesses?',
        answer: 'COCOA offers freemium version for businesses but with limited features. They can always upgrade to unlock advanced features with subscriptions.',
    },
    {
        question: 'How can COCOA benefit vendors and buyers?',
        answer: "COCOA streamlines B2B procurement by connecting buyers and vendors through a unified platform. Buyers save time with AI- powered vendor matching and real-time analytics, while vendors reduce costs by accessing pre-qualified buyers and gaining market insights. The platform's direct communication tools and centralized features eliminate the typical frustrations of fragmented procurement processes.",
    },
]

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 max-w-6xl mx-auto">
          <div>
            <h2 className="text-7xl font-bold text-[#5D4C7C] sticky top-20 font-nunito">
              FAQ
            </h2>
          </div>

          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b border-gray-300">
                <button
                  className="w-full py-4 flex justify-between items-center text-left group"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="text-xl font-medium text-gray-800 group-hover:text-[#5D4C7C] transition-colors">
                    {faq.question}
                  </span>
                  <IoIosArrowDown
                    className={`text-[#5D4C7C] transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    size={28}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <p className="pb-4 text-gray-600 text-lg">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
