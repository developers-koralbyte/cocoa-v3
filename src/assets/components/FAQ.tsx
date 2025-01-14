import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Cocoa?",
    answer:
      "Cocoa is an innovative platform designed to streamline restaurant operations and enhance vendor-buyer relationships in the food service industry.",
  },
  {
    question: "Is Cocoa a POS?",
    answer:
      "No, Cocoa is not just a POS system. It's a comprehensive solution that connects restaurants with vendors and streamlines the entire supply chain process.",
  },
  {
    question: "Is Cocoa FREE for Restaurants?",
    answer:
      "Yes, basic features are available for free to restaurants. Premium features are available through our subscription plans.",
  },
  {
    question: "How can Cocoa benefit vendors and buyers?",
    answer:
      "Cocoa provides a centralized platform for vendors and buyers to connect, streamline ordering processes, manage inventory, and optimize their supply chain operations.",
  },
];

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
            <h2 className="text-7xl font-bold text-[#5D4C7C] sticky top-20">
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
