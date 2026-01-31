import React from 'react';
import Link from 'next/link';

export default function TermsAndConditions() {
  return (
    <div className=" bg-white px-[32px] py-[32px] md:px-[94px] md:py-[54px]">
      <div className="">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-inter font-bold text-[24px] leading-[36px] tracking-normal text-center text-gray-800 mb-8">
           Terms & Conditions
          </h1>
        </div>

        {/* Content Section */}
        <div className="bg-gray-100 rounded-2xl md:px-[124px] p-[16px] md:py-[56px] shadow-sm mb-[54px]" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="space-y-6 text-gray-700 text-center">
            <p className="text-base sm:text-lg leading-relaxed">
             By accessing or using our platform, you agree to comply with these terms and conditions. Users are responsible for ensuring that all information provided during registration, listing creation, and booking processes is accurate and complete.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              The platform serves as a marketplace that facilitates connections and transactions between users and providers. While we provide tools for booking, payment, and communication, we do not directly offer venue or service fulfillment and are not responsible for the performance or quality of services provided.
            </p>

            <p className="text-base sm:text-lg leading-relaxed">
              All bookings, payments, cancellations, and refunds are subject to platform policies and the individual terms set by providers. We reserve the right to suspend or terminate accounts that violate our policies, engage in fraudulent behavior, or misuse the platform. These terms may be updated periodically to ensure legal compliance and platform improvement.
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
              href="/serviceprovider/auth/signin "
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