'use client';
import React, { useState } from 'react';
import { Menu, X, MessageCircle, Bell, User } from 'lucide-react';
import logo from "@/public/logo.svg";
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Home', href: '/pages/homepage' },
    { name: 'Find Venues', href: '/pages/findVenues' },
    { name: 'Find Event Planners', href: '/pages/findEventPlanners' },
    { name: 'Find Service', href: '/pages/findServiceProvider' },
    { name: 'About Us', href: '/pages/aboutus' },
  ];

  // Handle sign in/out
  const handleAuthClick = () => {
    if (isSignedIn) {
      setIsSignedIn(false);
      console.log('User signed out');
    } else {
      setIsSignedIn(true);
      console.log('User signed in');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#fceded] shadow-sm sticky top-0 z-50">
      <div className="px-[20px] md:px-[50px] py-[16px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div onClick={()=>{router.push("/pages/homepage")}} className="flex items-center cursor-pointer">
            <Image src={logo} alt="Logo" width={75} height={55} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative">
                <a
                  href={link.href}
                  className={`relative transition-colors ${
                    pathname === link.href || (link.href === '/pages/findServiceProvider' && pathname.includes('/pages/findServiceProvider'))
                      ? 'text-[#B74140]'
                      : 'text-gray-700 hover:text-[#B74140]'
                  }`}
                >
                  {link.name}
                  {(pathname === link.href || (link.href === '/pages/findServiceProvider' && pathname.includes('/pages/findServiceProvider'))) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#B74140]"></span>
                  )}
                </a>
              </div>
            ))}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <button onClick={()=>{router.push("/home/dashboard/chat")}} className="p-[5px] border border-[#ADAEBC] rounded-full text-gray-700 hover:text-[#B74140] bg-[#F8FAFB] transition-colors relative">
                  <MessageCircle className="w-[22px] h-[22px]" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button onClick={()=>{router.push("/home/dashboard/notification")}} className="p-[5px] border border-[#ADAEBC] rounded-full text-gray-700 hover:text-[#B74140] bg-[#F8FAFB] transition-colors relative">
                  <Bell className="w-[22px] h-[22px]" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button onClick={()=>{router.push("/home/dashboard/profileSettings")}} className="p-[5px] border border-[#ADAEBC] rounded-full text-gray-700 hover:text-[#B74140] bg-[#F8FAFB] transition-colors relative">
                  <div className="rounded-full flex items-center justify-center">
                    <User className="w-[22px] h-[22px]" />
                  </div>
                </button>
                <button 
                  onClick={handleAuthClick}
                  className="bg-[#B74140] text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button 
                onClick={handleAuthClick}
                className="bg-[#B74140] text-white px-6 py-2 rounded-md hover:bg-[#a03736] transition-colors"
              >
                Sign In
              </button>
            )}
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
                  <a
                    href={link.href}
                    className={`block transition-colors ${
                      pathname === link.href || (link.href === '/pages/findServiceProvider' && pathname.includes('/pages/findServiceProvider'))
                        ? 'text-[#B74140]'
                        : 'text-gray-700 hover:text-[#B74140]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="relative">
                      {link.name}
                      {(pathname === link.href || (link.href === '/pages/findServiceProvider' && pathname.includes('/pages/findServiceProvider'))) && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#B74140]"></span>
                      )}
                    </span>
                  </a>
                </div>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t">
                {isSignedIn ? (
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button onClick={()=>{router.push("/home/dashboard/profileSettings")}} className="p-[5px] rounded-full flex items-center justify-center border border-[#F8FAFB]">
                          <User className="w-6 h-6" />
                        </button>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-gray-500">john@example.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button onClick={()=>{router.push("/home/dashboard/chat")}} className="flex-1 flex flex-col items-center p-3 text-gray-700 hover:text-[#B74140] transition-colors border rounded-lg">
                        <MessageCircle className="w-5 h-5 mb-1" />
                        <span className="text-xs">Messages</span>
                      </button>
                      <button onClick={()=>{router.push("/home/dashboard/notifications")}} className="flex-1 flex flex-col items-center p-3 text-gray-700 hover:text-[#B74140] transition-colors border rounded-lg relative">
                        <Bell className="w-5 h-5 mb-1" />
                        <span className="text-xs">Notifications</span>
                        <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
                      </button>
                    </div>
                    <button 
                      onClick={handleAuthClick}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAuthClick}
                    className="bg-[#B74140] text-white px-6 py-3 rounded-md hover:bg-[#a03736] transition-colors w-full"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
