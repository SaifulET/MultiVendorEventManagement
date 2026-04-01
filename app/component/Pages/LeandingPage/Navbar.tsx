'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Menu, MessageCircle, User, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import logo from '@/public/logo.svg';
import { useAuthStore } from '@/store/useAuthStore';

const navLinks = [
  { name: 'Home', href: '/pages/homepage' },
  { name: 'Find Venues', href: '/pages/findVenues' },
  { name: 'Find Event Planners', href: '/pages/findEventPlanners' },
  { name: 'Find Service', href: '/pages/findServiceProvider' },
  { name: 'About Us', href: '/pages/aboutus' },
];

const isLinkActive = (pathname: string, href: string) =>
  pathname === href ||
  (href === '/pages/findServiceProvider' && pathname.includes('/pages/findServiceProvider'));

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isSignedIn = hasMounted && Boolean(token);
  const displayName = useMemo(() => {
    if (user?.fullName?.trim()) {
      return user.fullName.trim();
    }

    return 'My Profile';
  }, [user]);

  const displayEmail = useMemo(() => {
    if (user?.email?.trim()) {
      return user.email.trim();
    }

    return 'Signed in';
  }, [user]);

  const handleSignIn = () => {
    setIsMobileMenuOpen(false);
    router.push('/home/auth/signin');
  };

  const handleRouteChange = (path: string) => {
    setIsMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#fceded] shadow-sm">
      <div className="px-[20px] py-[16px] md:px-[50px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/pages/homepage')}
            className="flex items-center"
            aria-label="Go to homepage"
          >
            <Image src={logo} alt="Logo" width={75} height={55} />
          </button>

          <div className="hidden items-center space-x-8 lg:flex">
            {navLinks.map((link) => {
              const active = isLinkActive(pathname, link.href);

              return (
                <div key={link.name} className="relative">
                  <Link
                    href={link.href}
                    className={`relative transition-colors ${
                      active ? 'text-[#B74140]' : 'text-gray-700 hover:text-[#B74140]'
                    }`}
                  >
                    {link.name}
                    {active ? (
                      <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-[#B74140]" />
                    ) : null}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="hidden items-center space-x-4 lg:flex">
            {isSignedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => handleRouteChange('/home/dashboard/chat')}
                  className="relative rounded-full border border-[#ADAEBC] bg-[#F8FAFB] p-[5px] text-gray-700 transition-colors hover:text-[#B74140]"
                  aria-label="Chat"
                >
                  <MessageCircle className="h-[22px] w-[22px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRouteChange('/home/dashboard/notification')}
                  className="relative rounded-full border border-[#ADAEBC] bg-[#F8FAFB] p-[5px] text-gray-700 transition-colors hover:text-[#B74140]"
                  aria-label="Messages"
                >
                  <Bell className="h-[22px] w-[22px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRouteChange('/home/dashboard/profileSettings')}
                  className="rounded-full border border-[#ADAEBC] bg-[#F8FAFB] p-[5px] text-gray-700 transition-colors hover:text-[#B74140]"
                  aria-label="Profile"
                  title={displayName}
                >
                  <User className="h-[22px] w-[22px]" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="rounded-md bg-[#B74140] px-6 py-2 text-white transition-colors hover:bg-[#a03736]"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            type="button"
            className="text-gray-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="mt-4 pb-4 lg:hidden">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => {
                const active = isLinkActive(pathname, link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block transition-colors ${
                      active ? 'text-[#B74140]' : 'text-gray-700 hover:text-[#B74140]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="relative">
                      {link.name}
                      {active ? (
                        <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-[#B74140]" />
                      ) : null}
                    </span>
                  </Link>
                );
              })}

              <div className="border-t pt-4">
                {isSignedIn ? (
                  <div className="flex flex-col space-y-4">
                    <button
                      type="button"
                      onClick={() => handleRouteChange('/home/dashboard/profileSettings')}
                      className="flex items-center gap-3 rounded-lg border px-3 py-3 text-left"
                    >
                      <div className="rounded-full border border-[#ADAEBC] bg-[#F8FAFB] p-[5px] text-gray-700">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-500">{displayEmail}</p>
                      </div>
                    </button>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => handleRouteChange('/home/dashboard/chat')}
                        className="flex flex-1 flex-col items-center rounded-lg border p-3 text-gray-700 transition-colors hover:text-[#B74140]"
                      >
                        <MessageCircle className="mb-1 h-5 w-5" />
                        <span className="text-xs">Chat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRouteChange('/home/dashboard/notification')}
                        className="flex flex-1 flex-col items-center rounded-lg border p-3 text-gray-700 transition-colors hover:text-[#B74140]"
                      >
                        <Bell className="mb-1 h-5 w-5" />
                        <span className="text-xs">Messages</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="w-full rounded-md bg-[#B74140] px-6 py-3 text-white transition-colors hover:bg-[#a03736]"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
