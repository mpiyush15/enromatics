"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useOptionalAuth from "@/hooks/useOptionalAuth";

export default function Navbar() {
  const { user, loading } = useOptionalAuth();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  /* ✅ Handle theme + mount */
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;
    if (savedTheme === "dark") {
      html.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  /* ✅ Close dropdowns when route changes */
  useEffect(() => {
    setIsServicesOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  /* ✅ Close Services dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    if (isServicesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isServicesOpen]);

  /* ✅ Close mobile menu on ESC key */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  /* ✅ Theme toggle */
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

  /* ✅ Close mobile menu when clicking a link */
  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 opacity-80 bg-white dark:bg-neutral-900 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex justify-between items-center h-16 relative z-50">
          {/* LOGO */}
          <Link
            href="/"
            onClick={() => {
              setIsMenuOpen(false);
              setIsServicesOpen(false);
            }}
            className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            Enro Matics
          </Link>

          {/* MAIN MENU (centered flex grow) */}
          <ul className="hidden md:flex justify-center flex-1 space-x-8 text-gray-700 dark:text-gray-200 font-medium">
            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link></li>
            <li><Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About Us</Link></li>
            <li ref={servicesRef} className="relative">
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Services ▾
              </button>
              {isServicesOpen && (
                <ul className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md rounded-md z-50 w-48 text-sm">
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link href="/services/student-management" onClick={() => setIsServicesOpen(false)}>Student Management</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link href="/services/scholarship-exams" onClick={() => setIsServicesOpen(false)}>Scholarship Exams</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link href="/services/video-editing" onClick={() => setIsServicesOpen(false)}>Video Editing</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link href="/services/facebook-marketing" onClick={() => setIsServicesOpen(false)}>Facebook Marketing</Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link href="/services/instagram-marketing" onClick={() => setIsServicesOpen(false)}>Instagram Marketing</Link>
                  </li>
                </ul>
              )}
            </li>
            <li><Link href="/plans" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</Link></li>
          </ul>

          {/* RIGHT SIDE BUTTONS */}
          <div className="hidden md:flex items-center gap-3 relative z-50">
            {mounted && !user && (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {/* Theme toggle always visible */}
            <button
              onClick={toggleTheme}
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-lg"
            >
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-2xl text-gray-800 dark:text-white"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-3 space-y-2 bg-white dark:bg-gray-900 border-t dark:border-gray-800 text-gray-800 dark:text-white">
          <Link href="/" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Home</Link>
          <Link href="/about" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>About Us</Link>
          
          <div>
            <button 
              onClick={() => setIsServicesOpen(!isServicesOpen)} 
              className="block w-full text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Services ▾
            </button>
            {isServicesOpen && (
              <div className="ml-4 space-y-1 mt-2">
                <Link href="/services/student-management" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Student Management</Link>
                <Link href="/services/scholarship-exams" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Scholarship Exams</Link>
                <Link href="/services/video-editing" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Video Editing</Link>
                <Link href="/services/facebook-marketing" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Facebook Marketing</Link>
                <Link href="/services/instagram-marketing" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Instagram Marketing</Link>
              </div>
            )}
          </div>
          
          <Link href="/plans" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Pricing</Link>
          <Link href="/contact" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Contact</Link>

          {!user && (
            <>
              <Link href="/login" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Login</Link>
              <Link href="/register" className="block py-2 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={handleLinkClick}>Sign Up</Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="mt-3 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
          >
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      )}
    </nav>
  );
}
