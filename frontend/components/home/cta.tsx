// components/landing/Hero.tsx

import React from "react";

export default function CTA() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className=" mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white">
          Dashboard 
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Below hero CTA
        </p>
        <div className="mt-8 animate-bounce text-gray-500 dark:text-gray-400">
          ↓ Scroll to explore
        </div>
      </div>
    </section>
  );
}