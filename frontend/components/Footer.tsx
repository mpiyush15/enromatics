"use client";

import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (session) return null;

  return (
    <footer className="bg-neutral-900 text-gray-400 py-8  w-full">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Forte Studioz. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
          <a href="/about" className="hover:text-white transition">About</a>
          <a href="/services" className="hover:text-white transition">Services</a>
          <a href="/contact" className="hover:text-white transition">Contact</a>
          <a href="https://github.com/fortestudioz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
        </div>
      </div>
    </footer>
  );
}