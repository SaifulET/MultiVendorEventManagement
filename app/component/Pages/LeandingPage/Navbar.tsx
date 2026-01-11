'use client';
import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import logo from "@/public/logo.svg";
import Image from 'next/image';
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Find Venues', href: '#' },
    { name: 'Find Event Planners', href: '#' },
    { name: 'Find Service', href: '#', hasDropdown: true },
    { name: 'About Us', href: '#' },
  ];

  return (
    <nav className="bg-[#B741401A] shadow-sm">
      <div className="px-[20px] md:px-[50px] py-[16px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image src={logo} alt="Logo" width={75} height={55}/>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                {link.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsServiceOpen(true)}
                    onMouseLeave={() => setIsServiceOpen(false)}
                  >
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-[#B74140] transition-colors">
                      <span>{link.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isServiceOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                        {/* Placeholder for dropdown items - you can add these later */}
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Service 1
                        </a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Service 2
                        </a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                          Service 3
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={link.href}
                    className="text-gray-700 hover:text-[#B74140] transition-colors"
                  >
                    {link.name}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Sign In Button - Desktop */}
          <div className="hidden lg:block">
            <button className="bg-[#B74140] text-white px-6 py-2 rounded-md hover:bg-[#a03736] transition-colors">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setIsServiceOpen(!isServiceOpen)}
                        className="flex items-center justify-between w-full text-gray-700 hover:text-[#B74140] transition-colors"
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isServiceOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isServiceOpen && (
                        <div className="mt-2 ml-4 space-y-2">
                          <a href="#" className="block text-gray-600 hover:text-[#B74140]">
                            Service 1
                          </a>
                          <a href="#" className="block text-gray-600 hover:text-[#B74140]">
                            Service 2
                          </a>
                          <a href="#" className="block text-gray-600 hover:text-[#B74140]">
                            Service 3
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      className="block text-gray-700 hover:text-[#B74140] transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </div>
              ))}
              <button className="bg-[#B74140] text-white px-6 py-2 rounded-md hover:bg-[#a03736] transition-colors w-full">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}