import type { ReactNode } from "react";

import Header from "@/app/component/universalComponent/Navbar/Navbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
    </div>
  );
}
