"use client";

import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // const hideNavAndFooter = pathname === "/login";
  const hideNavAndFooter = pathname.startsWith("/login");

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {children}
      </main>
      {!hideNavAndFooter && <Footer />}
    </>
  );
}