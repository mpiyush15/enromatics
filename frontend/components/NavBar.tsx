"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  if (status === "loading") return null;
  if (session) return null;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-neutral-900/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
            Vaibhav Group
          </Link>

          <div className="md:hidden ml-auto">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl text-gray-800 dark:text-white">
              ☰
            </button>
          </div>

          <ul className="hidden md:flex space-x-6 items-center text-gray-700 dark:text-gray-200 mx-auto ">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li className="relative">
              <button onClick={() => setIsServicesOpen(!isServicesOpen)}>Services ▾</button>
              {isServicesOpen && (
                <ul className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow rounded z-10 min-w-max">
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><Link href="/services/video-editing">Video Editing</Link></li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><Link href="/services/facebook-marketing">Facebook Marketing</Link></li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><Link href="/services/instagram-marketing">Instagram Marketing</Link></li>
                
                </ul>
                
              )}
            </li>
            <li><Link href="/plans">Pricing</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            
            <li>
              
          
            </li>
          </ul>

              <Link href="/login">
              <button className="hidden md:flex ml-6 px-4 py-2 rounded-md bg-black text-white dark:bg-blue-600 hover:opacity-90 transition">
              Login
            </button>
              </Link>
               <button onClick={toggleTheme} className=" hidden md:flex px-2 ml-2.5 py-1 rounded bg-gray-200 dark:bg-gray-700">
                {isDark ? "🌙" : "☀️"}
              </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-2 space-y-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
          <Link href="/" className="block">Home</Link>
          <Link href="/about" className="block">About Us</Link>
          <button onClick={() => setIsServicesOpen(!isServicesOpen)} className="block">Services ▾</button>
          {isServicesOpen && (
            <div className="ml-4 space-y-1">
              <Link href="/services/video-editing" className="block">Video Editing</Link>
              <Link href="/services/facebook-marketing" className="block">Facebook Marketing</Link>
              <Link href="/services/instagram-marketing" className="block">Instagram Marketing</Link>
            </div>
          )}
          <Link href="/plans" className="block">Pricing</Link>
          <Link href="/contact" className="block">Contact Us</Link>
          <Link href="/login" className="block">Login</Link>
          <button onClick={toggleTheme} className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      )}
    </nav>
  );
}