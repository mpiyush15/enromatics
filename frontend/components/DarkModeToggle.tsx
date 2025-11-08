"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check stored theme or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const html = document.documentElement;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      html.classList.add("dark");
      setIsDark(true);
    } else {
      html.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
      console.log("Switched to light mode");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
      console.log("Switched to dark mode");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white transition"
      aria-label="Toggle dark mode"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}