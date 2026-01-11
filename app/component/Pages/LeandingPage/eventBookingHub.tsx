'use client';

import React from 'react';
import logo1 from "@/public/top.svg"
import logo2 from "@/public/catering.svg"
import logo3 from "@/public/fullEvent.svg"
import logo4 from "@/public/alltime.svg"
import Image from 'next/image';
export default function EventBookingPage() {
  return (
    <div className=" bg-[#F8ECEC] flex items-center justify-center py-[102px] px-[32px] md:px-[150px]">
      <div className="w-full">
        {/* Header Section */}
        <div className="text-center mb-[50px] md:mb-[64px]">
          <h1 className="font-inter font-semibold text-[36px] leading-[40px] tracking-normal text-center align-middle
mb-[24px]">
            Welcome to Event Booking Hub
          </h1>
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto  mb-[64px]">
            Plan your perfect event with ease. Whether you are booking a marriage hall, arranging catering, or hiring
            event services like décor, lighting, or tents — we bring everything under one roof.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Top Marriage Halls */}
          <div className="flex flex-col items-center text-center group">
            <div className="mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-300">
             <Image src={logo1} alt="Top Marriage Halls" className="w-[36px] h-[36px] md:w-[50px] h-[50px]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              Top Marriage Halls
            </h3>
          </div>

          {/* Catering Services */}
          <div className="flex flex-col items-center text-center group">
            <div className="mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-300">
               <Image src={logo2} alt="Top Marriage Halls" className="w-[36px] h-[36px] md:w-[50px] h-[50px]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              Catering Services
            </h3>
          </div>

          {/* Full Event Setup */}
          <div className="flex flex-col items-center text-center group">
            <div className="mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-300">
              <Image src={logo3} alt="Top Marriage Halls" className="w-[36px] h-[36px] md:w-[50px] h-[50px]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              Full Event Setup
            </h3>
          </div>

          {/* 24/7 Support */}
          <div className="flex flex-col items-center text-center group">
            <div className="mb-4 md:mb-6 transition-transform group-hover:scale-110 duration-300">
              <Image src={logo4} alt="Top Marriage Halls" className="w-[36px] h-[36px] md:w-[50px] h-[50px]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
              24/7 Support
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}