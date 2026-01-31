"use client";

import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from "@/public/logo.svg"
import { useRouter } from 'next/navigation';
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
const router = useRouter();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-[#f5e6e8] border-b border-gray-200">
      <nav className=" px-4 sm:px-6 lg:px-[132px]">
        <div className="flex items-center justify-between h-[86px]">
          {/* Logo */}
          <div className="flex-shrink-0 py-[15px] ">
            <Link href="/home" className="flex items-center">
              <Image src={logo} alt='logo' width={75} height={55} priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8 ">
            <Link
              href="/home"
              className="text-gray-700 hover:text-gray-900 font-inter font-medium text-[14px] leading-[100%] tracking-[0] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/venues"
              className="text-gray-700 hover:text-gray-900 font-inter font-medium text-[14px] leading-[100%] tracking-[0] transition-colors"
            >
              Find Venues
            </Link>
            
            {/* Find Service Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                className="flex items-center text-gray-700 hover:text-gray-900 font-inter font-medium text-[14px] leading-[100%] tracking-[0] transition-colors"
                onMouseEnter={() => setIsServiceDropdownOpen(true)}
                onMouseLeave={() => setIsServiceDropdownOpen(false)}
              >
                Find Service
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {/* Dropdown Menu */}
              {isServiceDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                  onMouseEnter={() => setIsServiceDropdownOpen(true)}
                  onMouseLeave={() => setIsServiceDropdownOpen(false)}
                >
                  <a
                    href="/services/catering"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Catering
                  </a>
                  <a
                    href="/services/photography"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Photography
                  </a>
                  <a
                    href="/services/decoration"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Decoration
                  </a>
                  <a
                    href="/services/entertainment"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Entertainment
                  </a>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="text-gray-700 hover:text-gray-900 font-inter font-medium text-[14px] leading-[100%] tracking-[0] transition-colors"
            >
              About Us
            </Link>
          </div>

          {/* Sign In Button - Desktop */}
          <div className="hidden md:block">
            <button onClick={()=>{router.push('/venueprovider/auth/signin')}} className="bg-[#B74140] hover:bg-[#B74140] text-white px-[31px] py-[10px] rounded-md text-sm font-medium transition-colors">
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md font-inter font-medium text-[14px] leading-[100%] tracking-[0] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Home
              </Link>
              <a
                href="/venues"
                className="block px-3 py-2 rounded-md font-inter font-medium text-[14px] leading-[100%] tracking-[0] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Find Venues
              </a>
              
              {/* Mobile Find Service Section */}
              <div>
                <button
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md font-inter font-medium text-[14px] leading-[100%] tracking-[0] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Find Service
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isServiceDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isServiceDropdownOpen && (
                  <div className="pl-4 space-y-1">
                    <a
                      href="/services/catering"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Catering
                    </a>
                    <a
                      href="/services/photography"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Photography
                    </a>
                    <a
                      href="/services/decoration"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Decoration
                    </a>
                    <a
                      href="/services/entertainment"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Entertainment
                    </a>
                  </div>
                )}
              </div>

              <a
                href="/about"
                className="block px-3 py-2 rounded-md font-inter font-medium text-[14px] leading-[100%] tracking-[0] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                About Us
              </a>

              {/* Sign In Button - Mobile */}
              <div className="pt-4 px-3">
                <button onClick={() => router.push('/venueprovider/auth/signin')} className="w-full bg-[#B74140] hover:bg-[#741e1c] text-white px-6 py-2 rounded-md font-inter font-medium text-[14px] leading-[100%] tracking-[0] transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}