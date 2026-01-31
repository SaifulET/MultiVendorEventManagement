"use client";
import React, { useState } from "react";
import { MapPin, Star, Award, Heart, MessageSquare } from "lucide-react";
import bgimg from "@/public/bg1.svg";
import Image from "next/image";
import img from "@/public/profile.jpg"
import { useRouter } from "next/navigation";
interface CalendarDay {
  day: number;
  status: "available" | "booked";
  dayName: string;
}

interface Review {
  name: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
}

const WeddingPlannerProfile: React.FC = () => {
  const [currentMonth] = useState<string>("January 2024");

  // Calendar data - example for a month
  const calendarDays: Array<{
    day: number;
    status: "available" | "booked";
    dayName: string;
  }> = [
    { day: 1, status: "available", dayName: "Thu" },
    { day: 2, status: "booked", dayName: "Fri" },
    { day: 3, status: "available", dayName: "Sat" },
    { day: 4, status: "available", dayName: "Sun" },
    { day: 5, status: "booked", dayName: "Mon" },
    { day: 6, status: "available", dayName: "Tue" },
    { day: 7, status: "available", dayName: "Wed" },
    { day: 8, status: "available", dayName: "Thu" },
    { day: 9, status: "available", dayName: "Fri" },
    { day: 10, status: "available", dayName: "Sat" },
    { day: 11, status: "available", dayName: "Sun" },
    { day: 12, status: "available", dayName: "Mon" },
    { day: 13, status: "available", dayName: "Tue" },
    { day: 14, status: "available", dayName: "Wed" },
    { day: 15, status: "booked", dayName: "Thu" },
    { day: 16, status: "available", dayName: "Fri" },
    { day: 17, status: "available", dayName: "Sat" },
    { day: 18, status: "available", dayName: "Sun" },
    { day: 19, status: "available", dayName: "Mon" },
    { day: 20, status: "available", dayName: "Tue" },
    { day: 21, status: "available", dayName: "Wed" },
    { day: 22, status: "available", dayName: "Thu" },
    { day: 23, status: "available", dayName: "Fri" },
    { day: 24, status: "available", dayName: "Sat" },
    { day: 25, status: "available", dayName: "Sun" },
    { day: 26, status: "booked", dayName: "Mon" },
    { day: 27, status: "available", dayName: "Tue" },
    { day: 28, status: "available", dayName: "Wed" },
    { day: 29, status: "available", dayName: "Thu" },
    { day: 30, status: "available", dayName: "Fri" },
    { day: 31, status: "available", dayName: "Sat" },
  ];

  const portfolioImages: string[] = [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519167758481-83f29da8c2a6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop",
  ];

  const reviews: Review[] = [
    {
      name: "Sarah Johnson",
      rating: 5,
      date: "2 weeks ago",
      text: "Absolutely stunning venue! The staff was incredibly helpful and the space exceeded our expectations. Our wedding was perfect thanks to their attention to detail.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      name: "Michael Chen",
      rating: 4,
      date: "1 month ago",
      text: "Great venue for corporate events. The AV equipment was top-notch and the catering was excellent. Would definitely book again for future events.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      name: "Emily Rodriguez",
      rating: 5,
      date: "3 weeks ago",
      text: "Beautiful space with amazing city views. The event coordination team made everything seamless. Highly recommend for any special occasion.",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  const weekDays: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const router = useRouter()
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-[220px] md:h-[320px] ">
        <Image
          src={bgimg.src}
          alt="Wedding venue"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
      </div>

      {/* Profile Card - Overlapping the hero image */}
      <div className="px-[32px] md:px-[168px]">
        <div className="relative -mt-16 md:-mt-20">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left Section: Profile Info */}
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <Image
                  src={img}
                  alt="Marvin McKinney"
                  width={128}
                  height={128}
                  className="rounded-full object-cover border-4 border-white shadow-md
             w-24 h-24 md:w-32 md:h-32"
                />

                <div className="flex-1">
                  <h1 className="font-inter font-bold text-[18px] md:text-[24px] leading-[32px] tracking-normal  text-gray-900">
                    Marvin McKinney
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Premium Wedding & Event Planner
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      New York, NY & Tri-State Area
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">4.9</span>
                    <span className="text-gray-500 text-sm">(127 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Right Section: Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                <button onClick={()=>{router.push("/home/dashboard/chat")}} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>Contact Provider</span>
                </button>
                <button onClick={()=>{router.push("/pages/findEventPlannerConfirmation/details")}} className="px-6 py-3 bg-[#B74140] text-white rounded-lg hover:bg-[#963533] transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Pricing */}
          <div className="mt-[48px] flex items-center gap-[16px]">
            <div className="text-[#B74140] text-[16px] font-bold">$</div>
            <div className="flex flex-col">
              <span className="font-inter font-normal text-[14px] leading-[20px] tracking-normal text-gray-600">
                Starting from
              </span>
              <span className="font-inter font-semibold text-[18px] leading-[28px] tracking-normal text-gray-900">
                $500/ hour
              </span>
            </div>
          </div>
        </div>

        {/* About My Services */}
        <div className="mt-8 bg-white rounded-lg  border border-[#E5E7EB] p-6 md:p-8">
          <h2 className="font-inter font-semibold text-[20px] leading-[1] tracking-normal text-gray-900 mb-4">
            About my Services
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            With over 10 years of experience in luxury event planning, I
            specialize in creating unforgettable weddings and corporate events.
            My attention to detail and personalized approach ensures every
            celebration is perfectly tailored to your vision.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#B741401A] rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#B74140]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  10+ Years Experience
                </h3>
                <p className="text-sm text-gray-600 mt-1">Industry expertise</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#B741401A] rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-[#B74140]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  500+ Events Planned
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Proven track record
                </p>
              </div>
            </div>
          </div>
        </div>

       

        {/* Availability Calendar */}
        <div className="mt-8 bg-white rounded-lg border border-[#E5E7EB] p-6 md:p-8">
          <h2 className="font-inter font-semibold text-[20px] leading-[1] tracking-normal text-gray-900 mb-6">
            Availability Calendar
          </h2>

          <div className="">
            <div className="">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid - Updated for rectangular buttons */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer  
              h-10 md:h-12
              ${
                item.status === "available"
                  ? item.day === 1
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-emerald-50 text-gray-900 hover:bg-emerald-100"
                  : "bg-red-50 text-gray-900 hover:bg-red-100"
              }`}
                  >
                    {item.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-gray-600">Booked</span>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="mt-8 mb-12 bg-white rounded-lg  border border-[#E5E7EB] p-6 md:p-8">
          <h2 className="font-inter font-semibold text-[20px] leading-[1] tracking-normal text-gray-900 mb-6">
            Reviews & Ratings
          </h2>

          <div className="space-y-6">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="pb-6 border-b border-gray-200 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {review.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPlannerProfile;
