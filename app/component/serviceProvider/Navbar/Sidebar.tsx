"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.svg"
import {
  LayoutDashboard,
  BookCheck,
  School,
  CreditCardIcon,
  Crown,
  Settings2,
  ChevronDown,
} from "lucide-react";

const MENU = [
  {
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/serviceprovider/dashboard/dashboard",
      },
      { 
        label: "Booking Requests", 
        icon: BookCheck, 
        href: "/serviceprovider/dashboard/bookingRequest" 
      },
      { 
        label: "My Services", 
        icon: School, 
        href: "/serviceprovider/dashboard/myServices" 
      },
      { 
        label: "Payments", 
        icon: CreditCardIcon, 
        href: "/serviceprovider/dashboard/payment" 
      },
      { 
        label: "Subscription", 
        icon: Crown, 
        href: "/serviceprovider/dashboard/subscription" 
      },
      { 
        label: "profile & Settings", 
        icon: Settings2, 
        href: "/serviceprovider/dashboard/profileSettings" 
      },
    ],
  },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
const handleDashboard=()=>{
  router.push("/serviceprovider/dashboard/dashboard")
}
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (route: string) => pathname.startsWith(route);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 fixed left-0 top-0 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div onClick={()=>{handleDashboard()}} className={`flex items-center justify-center px-6 ${collapsed?"py-9":"py-[21px]"}`}>
        {collapsed ? (
          <Image src={logo} alt="logo" width={40} height={30} />
        ) : (
          <Image src={logo} alt="logo" width={75} height={55} />
        )}
      </div>
<hr className="text-gray-200"/>
      <div className="px-4 pt-2 space-y-4">
        {MENU.map((section) => (
          <div key={1}>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 py-4 pl-3 rounded-xl transition ${
                      isActive(item.href)
                        ? "bg-[#B74140]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive(item.href) ? "text-white" : "text-gray-700"
                      }`}
                    />
                    {!collapsed && (
                      <span
                        className={`text-[15px] ${
                          isActive(item.href) ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}