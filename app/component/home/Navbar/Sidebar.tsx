"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.svg";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const MENU = [
  {
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/home/dashboard/dashboard",
      },
      {
        label: "My Bookings",
        icon: Calendar,
        href: "/home/dashboard/mybookings",
      },
      {
        label: "Payments",
        icon: CreditCard,
        href: "/home/dashboard/payment",
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

  const handleDashboard = () => {
    router.push("/home/dashboard/dashboard");
  };

  const handleLogout = () => {
    router.push("/home/auth/signin");
  };

  const isActive = (route: string) => pathname.startsWith(route);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 fixed left-0 top-0 transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
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

      {/* Menu Items */}
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
                    <span className="text-[15px] font-normal">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-gray-200">
        {/* User Profile */}
        <div
          className={`flex items-center gap-3 px-3 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {!collapsed ? (
            <>
              <Image
                src="/placeholder-avatar.jpg" // Replace with actual avatar
                alt="Sarah Johnson"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Sarah Johnson
                </p>
                <p className="text-xs text-gray-500 truncate">
                  sarah@email.com
                </p>
              </div>
            </>
          ) : (
            <Image
              src="/placeholder-avatar.jpg" // Replace with actual avatar
              alt="Sarah Johnson"
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-3 mt-2 w-full text-[#B74140] hover:bg-red-50 rounded-lg transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && (
            <span className="text-[15px] font-normal">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}