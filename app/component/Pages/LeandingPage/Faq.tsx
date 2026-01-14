'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I book a venue?',
    answer: 'To book a venue, simply browse our venue listings, select your preferred location, choose your date and time, and complete the booking form. You\'ll receive a confirmation email once your booking is processed.'
  },
  {
    question: 'What types of services are available?',
    answer: 'We offer a comprehensive range of services including catering, decoration, audio/visual equipment, photography, event planning, security services, and entertainment options. Custom packages can be tailored to your specific event needs.'
  },
  {
    question: 'How do I join as a service provider?',
    answer: 'To become a service provider, click on the "Join as Provider" button, fill out the registration form with your business details, submit required documents for verification, and once approved, you can start listing your services on our platform.'
  },
  {
    question: 'Are there any booking fees?',
    answer: 'Yes, we charge a small service fee for each booking which covers platform maintenance, payment processing, and customer support. The exact fee percentage will be displayed during checkout before you confirm your booking.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className=" flex items-center justify-center bg-[#F8ECEC] ">
      <div className="w-full px-[32px] md:px-[272px] py-[32px] md:py-[80px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Everything you need to know about EventConnect
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden transition-all duration-200 "
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200 hover:bg-gray-50"
              >
                <span className="text-gray-800 font-medium text-sm md:text-base pr-4">
                  {item.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-[#B74140] transition-transform duration-200" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#B74140] transition-transform duration-200" />
                  )}
                </div>
              </button>

              {/* Answer Section */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-6 pb-4 pt-2">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}