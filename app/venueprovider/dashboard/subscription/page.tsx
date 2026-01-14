"use client";

import React from "react";
import { Check, Shield, Clock, Headphones, ShieldHalfIcon, RefreshCcw, Headset } from "lucide-react";

export default function SubscriptionManagement() {
  const plans = [
    {
      name: "Basic",
      description: "Perfect for getting started",
      price: 19,
      period: "month",
      features: [
        "Up to 100 clients",
        "Basic scheduling",
        "Email notifications",
        "5GB storage",
        "Mobile app access",
        "Basic analytics",
      ],
      highlighted: false,
      current: false,
    },
    {
      name: "Premium",
      description: "Most popular choice",
      price: 49,
      period: "month",
      features: [
        "Up to 500 clients",
        "Advanced scheduling",
        "SMS & email notifications",
        "50GB storage",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
        "API access",
      ],
      highlighted: true,
      current: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: 99,
      period: "year",
      features: [
        "Unlimited clients",
        "Enterprise scheduling",
        "Multi-channel notifications",
        "Unlimited storage",
        "24/7 dedicated support",
        "Custom analytics & reports",
        "White-label solution",
        "Advanced API & integrations",
        "SLA guarantee",
        "Custom onboarding",
      ],
      highlighted: false,
      current: false,
    },
  ];

  const trustFeatures = [
    {
      icon: ShieldHalfIcon,
      title: "Secure & Reliable",
      description: "Bank-level security with 99.9% uptime guarantee",
    },
    {
      icon: RefreshCcw,
      title: "Cancel Anytime",
      description: "No long-term contracts, cancel with one click",
    },
    {
      icon:Headset,
      title: "24/7 Support",
      description: "Our team is always here to help you succeed",
    },
  ];

  return (
    <div className="min-h-screen bg-white ">
      <div className="relative   py-[16px] lg:py-[22px]">
        {/* Header */}
        <div className="mb-[30px] lg:mb-[48px] animate-fade-in">
          <h1 className="font-inter font-bold text-[30px] leading-[36px] tracking-normal ">
            Subscription Management
          </h1>
        </div>

        {/* Current Plan Card */}
        <div className="mb-[32px] sm:mb-[48px] animate-slide-up">
          <div className="bg-[#B74140] rounded-3xl border border-[#E5E7EB] overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <div className="p-[24px] lg:p-[32px]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-6">
                <div>
                  <button className="font-inter font-semibold text-[14px] leading-[100%] tracking-[0] p-2 rounded-2xl bg-[rgba(229,231,235,0.5)] text-white">
                    Current Plan
                  </button>

                  <h2 className="font-inter font-bold text-[30px] leading-[36px] tracking-[0] text-white mb-2">
                    Premium Plan
                  </h2>
                  <p className="text-rose-100 text-base sm:text-lg">
                    Everything you need to grow your business
                  </p>
                </div>
                <button className="px-6 py-2.5 bg-white text-rose-600 rounded-xl font-semibold hover:bg-rose-50 transition-all duration-300 border border-[#E5E7EB] hover:shadow-xl self-start sm:self-auto transform hover:-translate-y-0.5">
                  Cancel Subscription
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E5E7EB]">
                  <p className="text-rose-100 font-inter font-normal text-[14px] leading-[20px] tracking-[0] mb-1">Billing Cycle</p>
                  <p className="text-white font-inter font-semibold text-[20px] leading-[28px] tracking-[0]">
                    Monthly
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E5E7EB]">
                  <p className="text-rose-100 font-inter font-normal text-[14px] leading-[20px] tracking-[0] mb-1">Next Renewal</p>
                  <p className="text-white font-inter font-semibold text-[20px] leading-[28px] tracking-[0]">
                    January 15, 2025
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E5E7EB]">
                  <p className="text-rose-100 font-inter font-normal text-[14px] leading-[20px] tracking-[0] mb-1">Amount</p>
                  <p className="text-white font-inter font-semibold text-[20px] leading-[28px] tracking-[0]">
                    $49/month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Choose Your Plan Section */}
        <div className="mb-[32px] sm:mb-[48px] animate-fade-in delay-200">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-inter font-bold text-[24px] leading-[32px] tracking-[0] text-center text-slate-900 mb-[8px] ">
              Choose Your Plan
            </h2>
            <p className="text-slate-600 font-inter font-normal text-[16px] leading-[24px] tracking-[0] text-center">
              Select the perfect plan for your business needs
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl   transform transition-all duration-500 border border-[#E5E7EB] hover:-translate-y-2 ${
                  plan.highlighted ? "lg:scale-105 ring-4 ring-[#B74140]" : ""
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: "slide-up 0.6s ease-out forwards",
                }}
              >
                {plan.highlighted && (
                  <div className="absolute top-[-25px] left-0 right-0">
                    <div className=" text-white text-center py-2 px-4">
                      <button className="text-sm font-semibold bg-[#B74140] py-1 px-8 rounded-full">
                        Current Plan
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`p-6 sm:p-8 ${
                    plan.highlighted ? "pt-12 sm:pt-14" : ""
                  }`}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-baseline mb-1">
                      <span className="text-5xl sm:text-6xl font-bold text-slate-900">
                        ${plan.price}
                      </span>
                      <span className="text-slate-600 ml-2 text-lg">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3.5 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 group-hover:bg-emerald-600 transition-colors duration-300">
                          <Check
                            className="w-3 h-3 text-white"
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-slate-700 text-sm sm:text-base leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-[#E5E7EB] ${
                      plan.current
                        ? "bg-[#B74140] text-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {plan.current ? "Current Plan" : "Upgrade Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="p-[33px] border border-[#E5E7EB] rounded-lg animate-fade-in delay-400">
          <div className="mb-[22px]">
            <h3 className="font-inter font-bold text-[20px] leading-[100%] tracking-[0] text-slate-900">
              Need help choosing?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-2"
                  style={{
                    animationDelay: `${index * 100 + 400}ms`,
                    animation: "fade-in 0.6s ease-out forwards",
                  }}
                >
                  <div className=" flex items-center justify-center h-[40px]">
                    <Icon
                      className="w-[24px] h-[32px]  text-[#B74140]"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h4 className="font-inter font-semibold text-[16px] leading-[24px] tracking-[0] text-slate-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="font-inter font-normal text-[14px] leading-[20px] tracking-[0]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-400 {
          animation-delay: 400ms;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .animate-pulse {
          animation: pulse 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
