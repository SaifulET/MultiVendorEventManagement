"use client";

import { Columns2, Bell, MessageSquare, MessageSquareMore } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import profile from "@/public/profile.jpg";
import logo from "@/public/logo.svg";
interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header
      className={`w-full bg-[#f0d7d7] border-b border-gray-200 flex items-center justify-between px-[32px] py-[16px] 
      transition-all duration-300 sticky top-0
     `}
    >
    <div><Image src={logo} alt="Logo" width={75} height={45} /></div>

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