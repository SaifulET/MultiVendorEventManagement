"use client";



import Navbar from "@/app/component/EventPlaner/Navbar/Navbar";
import Sidebar from "@/app/component/EventPlaner/Navbar/Sidebar";
import { useState } from "react";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

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
