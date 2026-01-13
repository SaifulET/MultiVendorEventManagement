import React from 'react';
import Link from 'next/link';

export default function OurVision() {
  return (
    <div className=" bg-white px-[32px] py-[32px] md:px-[94px] md:py-[54px]">
      <div className="">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-inter font-bold text-[24px] leading-[36px] tracking-normal text-center text-gray-800 mb-8">
           Our Vision
          </h1>
        </div>

        {/* Content Section */}
        <div className="bg-gray-100 rounded-2xl md:px-[124px] p-[16px] md:py-[56px] shadow-sm mb-[54px]" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="space-y-6 text-gray-700 text-center">
            <p className="text-base sm:text-lg leading-relaxed">
             Our vision is to become the most trusted and innovative event booking platform, setting a new standard for how events are planned and managed. We envision a future where anyone can plan an event with confidence, clarity, and ease, regardless of size or complexity.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              We aim to create a strong digital ecosystem that supports collaboration between event hosts, venue providers, and service providers. By embracing technology and continuous innovation, we seek to eliminate uncertainty, increase transparency, and foster long-term partnerships within the event industry.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              Our vision extends beyond bookings—we want to build a platform that drives growth, supports local businesses, and enhances the overall quality of event experiences worldwide.
            </p>
          </div>
        </div>

        {/* Call to Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Planning an Event Card */}
          <div 
            className="rounded-2xl p-8 sm:p-10 lg:p-12 shadow-lg text-center text-white transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: '#B74140' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Planning an Event?
            </h2>
            <p className="text-base sm:text-lg mb-8 opacity-95">
              Discover amazing venues for your next celebration
            </p>
            <Link 
              href="/venueprovider/auth/signin"
              className="inline-block bg-white text-gray-800 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-md"
              style={{ color: '#B74140' }}
            >
              Join as a Venue Provider
            </Link>
          </div>

          {/* Running a Business Card */}
          <div 
            className="rounded-2xl p-8 sm:p-10 lg:p-12 shadow-lg text-center text-white transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: '#B74140' }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Running a Business?
            </h2>
            <p className="text-base sm:text-lg mb-8 opacity-95">
              Join our platform and grow your service business with us
            </p>
            <Link 
              href="/serviceprovider/auth/signin"
              className="inline-block bg-white text-gray-800 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-md"
              style={{ color: '#B74140' }}
            >
              Join as a Service Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}