import React from 'react';
import Link from 'next/link';

export default function AboutUs() {
  return (
    <div className=" bg-white px-[32px] py-[32px] md:px-[94px] md:py-[54px]">
      <div className="">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-inter font-bold text-[24px] leading-[36px] tracking-normal text-center text-gray-800 mb-8">
            About Us
          </h1>
        </div>

        {/* Content Section */}
        <div className="bg-gray-100 rounded-2xl md:px-[124px] p-[16px] md:py-[56px] shadow-sm mb-[54px]" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="space-y-6 text-gray-700 text-center">
            <p className="text-base sm:text-lg leading-relaxed">
              We are a comprehensive event booking and management platform created to simplify the entire event planning
              journey. Our platform brings together event hosts, venue providers, and service providers in one unified ecosystem,
              making it easier to discover, book, and manage event-related services with confidence.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              Event planning often involves multiple steps, countless communications, and uncertainty around pricing and
              availability. We aim to remove these challenges by offering a structured, transparent, and reliable digital solution.
              From small private gatherings to large-scale events, our platform supports users at every stage of the planning
              process.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              We believe that trust and simplicity are the foundation of successful events. That is why we prioritize verified listings,
              real user reviews, clear pricing, and secure payment systems. At the same time, we empower venue owners and
              service providers with tools that help them showcase their offerings, manage bookings, and grow their businesses
              efficiently.
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