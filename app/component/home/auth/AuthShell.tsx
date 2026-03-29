import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import logo from "@/public/logo.svg";

const stats = [
  {
    value: "5,000+",
    label: "Service Providers",
    iconBg: "bg-[#4ADE80]",
    iconStroke: "#14532D",
    iconPath:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    value: "100%",
    label: "Secure Payments",
    iconBg: "bg-[#60A5FA]",
    iconStroke: "#1E3A8A",
    iconPath:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    value: "10,000+",
    label: "Events Booked",
    iconBg: "bg-[#FACC15]",
    iconStroke: "#713F12",
    iconPath:
      "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  },
  {
    value: "2,500+",
    label: "Venues Listed",
    iconBg: "bg-[#F472B6]",
    iconStroke: "#831843",
    iconPath:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  heroLines?: string[];
  heroAccentLineIndex?: number;
  heroDescription?: string;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  heroLines = ["Your Event Starts Here"],
  heroAccentLineIndex,
  heroDescription = "Book top venues and trusted service providers in minutes.",
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tl from-[#3A0101] via-[#C94B4B] via-[#8D1414] via-[#C94B4B] to-[#461b1b] px-6 py-5 md:px-12 md:py-0">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col items-center justify-center py-10">
        <div className="flex w-full flex-col items-center justify-between gap-12 lg:flex-row">
          <div className="w-full text-white lg:max-w-[560px] lg:py-10">
            <div>
              {heroLines.map((line, index) => (
                <h1
                  key={line}
                  className={`text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
                    heroAccentLineIndex === index ? "text-[#C94B4B]" : ""
                  }`}
                >
                  {line}
                </h1>
              ))}
              <p className="mt-3 text-base text-white/90 md:text-lg">
                {heroDescription}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15 md:p-5"
                >
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full md:h-14 md:w-14 ${stat.iconBg}`}
                  >
                    <svg
                      className="h-6 w-6 md:h-7 md:w-7"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={stat.iconStroke}
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={stat.iconPath}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold md:text-2xl">{stat.value}</p>
                    <p className="text-sm text-white/80 md:text-base">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:max-w-[480px]">
            <div className="rounded-[28px] border border-white/12 bg-black/15 p-4 backdrop-blur-sm md:p-6">
              <div className="mb-6 flex justify-center">
                <Image src={logo} alt="logo" width={174} height={128} priority />
              </div>

              <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
                {title}
              </h2>
              <p className="mb-8 mt-2 text-center text-base text-white/80 md:text-lg">
                {subtitle}
              </p>

              {children}

              <div className="mt-6 border-t border-white/20 pt-6 text-center text-xs text-white/70 md:text-sm">
                <div className="flex justify-center gap-6">
                  <Link
                    href="/pages/privacyPolicy"
                    className="transition-colors hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/pages/termsAndConditions"
                    className="transition-colors hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
