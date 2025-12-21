"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read current theme from DOM (already set by blocking script in layout)
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;
    
    if (newIsDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    setIsDark(newIsDark);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white transition"
        aria-label="Toggle dark mode"
        disabled
      >
        🌓
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white transition hover:opacity-80"
      aria-label="Toggle dark mode"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}