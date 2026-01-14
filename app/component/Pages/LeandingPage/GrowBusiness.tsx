'use client';

import React from 'react';

// Import your background image like this:
// import bgImage from '@/public/your-image.jpg';
// Or use a path string: '/images/business-bg.jpg'
import bg from "@/public/bg1.svg";
import icon1 from "@/public/serviceprovidericon.svg"
import icon2 from "@/public/eventPlaner.svg"
import icon3 from "@/public/venueprovider.svg"
import Image from 'next/image';
import { Check, Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface GrowBusinessSectionProps {
  backgroundImage?: string; // Optional prop to pass background image path
}

export default function GrowBusinessSection({ backgroundImage = '/business-bg.jpg' }: GrowBusinessSectionProps) {
  const router = useRouter(); 
  const services = [
    {
      id: 1,
      icon: icon1,
      title: 'Join as a Service Provider',
      description: 'Offer your services to thousands of event hosts and get booked for weddings, corporate events, and celebrations.',
       link:"/serviceprovider/auth/signin",
      features: [
        'Receive verified booking requests',
        'Flexible availability calendar',
        'Secure payments via Stripe',
      ],
    },
    {
      id: 2,
      icon: icon2,
      title: 'Join as a Event Planner',
      description: 'Step into events that need your expertise. Manage weddings, conferences, and private gatherings with precision and flair.',
      link:"/eventPlanner/auth/signin",
      features: [
        'Coordinate event logistics with ease',
        'Deliver memorable experiences for clients',
        'Build your reputation through successful events',
      ],
    },
    {
      id: 3,
      icon:icon3,
      title: 'Join as a Venue Provider',
      description: 'List your venue and start accepting bookings for weddings, conferences, and private events.',
      link:"/venueprovider/auth/signin",
      features: [
        'Manage venue availability',
        'Accept instant bookings',
        'Grow your venue revenue',
      ],
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center p-[32px] md:p-[80px] ">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={bg.src}
          alt="Business Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 md:px-[30px] w-full">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h1 className="font-inter font-bold text-[36px] leading-[40px] tracking-normal text-center
text-white mb-[12px] ">
            Grow Your Business With EVENIT
          </h1>
          <p className="font-inter font-normal text-[18px] leading-[28px] tracking-normal text-center text-[white]
">
            Join our platform and start receiving event bookings today
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px] ">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-[#E5E7EB]  transition-all duration-300 transform hover:-translate-y-2 flex flex-col px-[33px]"
            >
              {/* Icon Container */}
              <div className="flex justify-center pt-8 pb-6">
                <div className="px-[21px] py-[19px] bg-[#FFF5F5] rounded-lg flex items-center justify-center">
                  <Image src={service.icon} alt={service.title} className="w-[24px] h-[24px]" />
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 flex-grow flex flex-col">
                {/* Title */}
                <h3 className="font-inter font-semibold text-[20px] leading-[28px] tracking-normal
 text-gray-900 mb-3 ">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 mb-6  leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-6 flex-grow">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start flex-col">
                     
                      <span className="flex text-sm sm:text-base text-gray-700 pb-[12px]  ">
                        <Check className="w-5 h-5  text-[#B74140] pr-[4px] " />{feature}
                      </span>
                      <div className='w-full border-b border-[#E7E7E7] '></div>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
              
                <button onClick={()=>{router.push(service.link)}} className="w-full bg-[#B74140] hover:bg-[#9a3534] text-white font-semibold py-3 sm:py-3.5 rounded-lg transition-all duration-200 border border-[#E5E7EB] transform hover:-translate-y-0.5">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}