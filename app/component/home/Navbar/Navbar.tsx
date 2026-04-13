"use client";

import { Columns2, Bell, MessageSquare, MessageSquareMore } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import profile from "@/public/profile.jpg";
import { useAuthStore } from "@/store/useAuthStore";
import { formatRoleLabel, getFirstName } from "@/lib/user-display";
import { fetchAuthMeProfile } from "@/lib/auth-me";
import { PROFILE_IMAGE_UPDATED_EVENT } from "@/lib/profile-image";

interface NavbarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function Navbar({ collapsed, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [profileImage, setProfileImage] = useState(profile.src);
  const displayName = getFirstName(user?.fullName);
  const roleLabel = formatRoleLabel(user?.role ?? "customer");

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    let isMounted = true;

    const syncProfileImage = async () => {
      try {
        const profileData = await fetchAuthMeProfile();
        if (isMounted && profileData.profileImage) {
          setProfileImage(profileData.profileImage);
        }
      } catch {
        if (isMounted) {
          setProfileImage(profile.src);
        }
      }
    };

    const handleProfileImageUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ imageUrl?: string }>;
      const nextImage = customEvent.detail?.imageUrl?.trim();
      if (nextImage) {
        setProfileImage(nextImage);
      }
    };

    void syncProfileImage();
    window.addEventListener(PROFILE_IMAGE_UPDATED_EVENT, handleProfileImageUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(
        PROFILE_IMAGE_UPDATED_EVENT,
        handleProfileImageUpdated
      );
    };
  }, []);

  return (
    <header
      className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-[32px] py-[48px] 
      fixed top-0 z-30 transition-all duration-300 
      ${collapsed ? "left-20 w-[calc(100%-80px)]" : "left-64 w-[calc(100%-256px)]"}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center rounded-xl transition"
        >
          <Columns2 className="w-8 h-8 text-gray-600" />
        </button>

        <div className="hidden sm:flex flex-col">
          <p className="text-xl font-bold leading-tight text-gray-800">
            Welcome back, {displayName}!
          </p>
          <p className="mt-1 inline-flex w-fit rounded-full bg-[#B7414014] px-3 py-1 text-sm font-semibold text-[#9F2F2E]">
            Role: {roleLabel}
          </p>
        </div>
      </div>

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
          <img
            src={profileImage || profile.src}
            alt={user?.fullName || "User avatar"}
            className="h-[32px] w-[32px] rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.src = profile.src;
            }}
          />
        </button>
      </div>
    </header>
  );
}
