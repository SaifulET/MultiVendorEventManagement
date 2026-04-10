'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How does EVENIT work?',
    answer: 'EVENIT brings venues, staff, and event services together in one platform so you can discover options, compare providers, and manage bookings more easily.'
  },
  {
    question: 'How can I book a venue or staff?',
    answer: 'You can browse listings, choose the venue or service provider that fits your event, review the details, and submit your booking request directly through the platform.'
  },
  {
    question: 'Is the workforce verified?',
    answer: 'Yes, EVENIT is designed to connect you with trusted and reviewed professionals so you can book with more confidence.'
  },
  {
    question: 'Can I manage multiple events?',
    answer: 'Yes, you can use EVENIT to coordinate multiple bookings, services, and event needs from one place, making event management simpler and more organized.'
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
