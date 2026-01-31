"use client";

import { Columns2, Bell, MessageSquare, MessageSquareMore } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import profile from "@/public/profile.jpg";

interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ collapsed, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header
      className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-[32px] py-[48px] 
      fixed top-0 z-30 transition-all duration-300 
      ${collapsed ? "left-20 w-[calc(100%-80px)]" : "left-64 w-[calc(100%-256px)]"}`}
    >
      {/* Left Icon (Columns2) */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center rounded-xl transition"
      >
        <Columns2 className="w-8 h-8 text-gray-600" />
      </button>

      {/* Right Side - All Icons Right Aligned */}
      <div className="flex items-center gap-3">
        {/* Chat/Message Button */}
        <button
          onClick={() => handleNavigation('/home/dashboard/chat')}
          className={`relative flex items-center justify-center w-[32px] h-[32px] rounded-full transition ${
            isActive('/home/dashboard/chat')
              ? 'bg-[#DC3545] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Chat"
        >
          <MessageSquareMore className="w-[22px] h-[22px]" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={() => handleNavigation('/home/dashboard/notification')}
          className={`relative flex items-center justify-center w-[32px] h-[32px] rounded-full transition ${
            isActive('/home/dashboard/notification')
              ? 'bg-[#DC3545] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          aria-label="Notifications"
        >
          <Bell className="w-[22px] h-[22px]" />
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={() => handleNavigation('/home/dashboard/profileSettings')}
          className={`flex items-center justify-center relative w-[32px] h-[32px] rounded-full overflow-hidden transition ${
            isActive('/home/dashboard/profileSettings')
              ? ''
              : 'ring-2 ring-gray-200 hover:ring-gray-300'
          }`}
          aria-label="Profile"
        >
          <Image
            src={profile}
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full object-cover "
            priority
          />
        </button>
      </div>
    </header>
  );
}