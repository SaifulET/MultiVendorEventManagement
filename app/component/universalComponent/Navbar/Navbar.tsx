"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from "@/public/logo.svg"
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/pages/homepage' },
  { label: 'Find Venue', href: '/pages/findVenues' },
  { label: 'Find Eventplanner', href: '/pages/findEventPlanners' },
  { label: 'Find Service', href: '/pages/findServiceProvider' },
  { label: 'About', href: '/pages/aboutus' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            <Link href="/pages/homepage" className="flex items-center">
              <Image src={logo} alt='logo' width={75} height={55} priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8 ">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-gray-900 font-inter font-medium text-[14px] leading-[100%] tracking-[0] transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md font-inter font-medium text-[14px] leading-[100%] tracking-[0] text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

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
