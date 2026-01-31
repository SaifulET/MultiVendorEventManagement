'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import img from "@/public/logo.svg"
export default function Footer() {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    // Get logo from localStorage
    const storedLogo = localStorage.getItem('eventConnectLogo');
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
  }, []);

  return (
    <footer className="bg-gray-900 text-[#D1D5DB]">
      <div className="px-[32px] md:px-[104px] py-[32px] md:py-[64px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-[114px]">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/pages/homepage" className="flex items-center space-x-2">
              {/* Logo from localStorage */}
             
                <Image 
                  src={img} 
                  alt="EventConnect Logo" 
                  width={126} 
                  height={93}
                  className="object-contain"
                />
            
             
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Connecting event hosts with the perfect venues and service providers
              for unforgettable experiences.
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              <Link 
                href="https://facebook.com" 
                target="_blank"
                className="hover:text-red-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank"
                className="hover:text-red-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                href="https://instagram.com" 
                target="_blank"
                className="hover:text-red-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank"
                className="hover:text-red-400 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Information Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Information</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/pages/aboutus" 
                  className="text-sm hover:text-red-400 transition-colors duration-200 block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/pages/vision" 
                  className="text-sm hover:text-red-400 transition-colors duration-200 block"
                >
                  Our Vision
                </Link>
              </li>
              <li>
                <Link 
                  href="/pages/ourmission" 
                  className="text-sm hover:text-red-400 transition-colors duration-200 block"
                >
                  Our Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">For Providers</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/venueprovider/auth/signin" 
                  className="text-sm hover:text-red-400 transition-colors duration-200 block"
                >
                  Join as Venue Provider
                </Link>
              </li>
              <li>
                <Link 
                  href="/serviceprovider/auth/signin" 
                  className="text-sm hover:text-red-400 transition-colors duration-200 block"
                >
                  Join as Service Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="mailto:hello@eventconnect.com" 
                  className="flex items-start space-x-3 text-sm hover:text-red-400 transition-colors duration-200 group"
                >
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:text-red-400" />
                  <span className="break-all">hello@eventconnect.com</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="tel:+15551234567" 
                  className="flex items-start space-x-3 text-sm hover:text-red-400 transition-colors duration-200 group"
                >
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:text-red-400" />
                  <span>+1 (555) 123-4567</span>
                </Link>
              </li>
              <li>
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>123 Event Street, City, State</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 text-center md:text-left">
            <p className="text-sm text-gray-400">
              © 2025 EventConnect. &nbsp;All rights reserved.&nbsp;
            </p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-2 text-sm text-gray-400">
              <Link 
                href="/pages/privacyPolicy" 
                className="hover:text-red-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:inline">|</span>
              <Link 
                href="/pages/termsAndConditions" 
                className="hover:text-red-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}