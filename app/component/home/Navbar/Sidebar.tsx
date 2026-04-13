"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "@/public/logo.svg";
import profile from "@/public/profile.jpg";
import {
  LayoutDashboard,
  Calendar,
  Crown,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchAuthMeProfile } from "@/lib/auth-me";
import { PROFILE_IMAGE_UPDATED_EVENT } from "@/lib/profile-image";

const MENU = [
  {
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/home/dashboard/dashboard",
      },
      {
        label: "Subscription",
        icon: Crown,
        href: "/home/dashboard/subscription",
      },
      {
        label: "My Bookings",
        icon: Calendar,
        href: "/home/dashboard/mybookings",
      },
      {
        label: "Profile & Settings",
        icon: Settings,
        href: "/home/dashboard/profileSettings",
      },
    ],
  },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [profileImage, setProfileImage] = useState(profile.src);
  const [profileName, setProfileName] = useState(user?.fullName?.trim() || "User");
  const [profileEmail, setProfileEmail] = useState(user?.email?.trim() || "");

  const handleDashboard = () => {
    router.push("/home/dashboard/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/home/auth/signin");
  };

  const isActive = (route: string) => pathname.startsWith(route);

  useEffect(() => {
    setProfileName(user?.fullName?.trim() || "User");
    setProfileEmail(user?.email?.trim() || "");
  }, [user?.email, user?.fullName]);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      try {
        const profileData = await fetchAuthMeProfile();

        if (!isMounted) {
          return;
        }

        setProfileName(profileData.fullName.trim() || user?.fullName?.trim() || "User");
        setProfileEmail(profileData.email.trim() || user?.email?.trim() || "");
        setProfileImage(profileData.profileImage || profile.src);
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

    void syncProfile();
    window.addEventListener(PROFILE_IMAGE_UPDATED_EVENT, handleProfileImageUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(
        PROFILE_IMAGE_UPDATED_EVENT,
        handleProfileImageUpdated
      );
    };
  }, [user?.email, user?.fullName]);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 fixed left-0 top-0 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        onClick={handleDashboard}
        className="flex items-center justify-center px-6 py-7 cursor-pointer"
      >
        {collapsed ? (
          <Image src={logo} alt="logo" width={30} height={30} />
        ) : (
          <Image src={logo} alt="logo" width={140} height={30} />
        )}
      </div>

      <hr className="border-gray-200" />

      <div className="flex-1 px-3 pt-4 space-y-1">
        {MENU.map((section) => (
          <div key={1}>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    isActive(item.href)
                      ? "bg-[#B74140] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-[15px] font-normal">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200">
        <div
          className={`flex items-center gap-3 px-3 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {!collapsed ? (
            <>
              <img
                src={profileImage || profile.src}
                alt={profileName}
                className="h-10 w-10 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = profile.src;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profileName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profileEmail || "No email available"}
                </p>
              </div>
            </>
          ) : (
            <img
              src={profileImage || profile.src}
              alt={profileName}
              className="h-9 w-9 rounded-full object-cover"
              onError={(event) => {
                event.currentTarget.src = profile.src;
              }}
            />
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-3 mt-2 w-full text-[#B74140] hover:bg-red-50 rounded-lg transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-[15px] font-normal">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
