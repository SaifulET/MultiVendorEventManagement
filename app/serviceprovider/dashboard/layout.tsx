"use client";


import Navbar from "@/app/component/serviceProvider/Navbar/Navbar";
import Sidebar from "@/app/component/serviceProvider/Navbar/Sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    if (!user?.role) {
      return;
    }

    if (user.role === "venue_provider") {
      router.replace("/venueprovider/dashboard/dashboard");
      return;
    }

    if (user.role !== "service_provider") {
      router.replace("/");
    }
  }, [router, user?.role]);

  return (
    <div>
      <Sidebar collapsed={collapsed} />
      <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <main
        className={`pt-30 px-10 bg-white min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
