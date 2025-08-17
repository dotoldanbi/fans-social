"use client";
import React, { useEffect, useState } from "react";

import { useTheme } from "next-themes";
import { LuSunMedium } from "react-icons/lu";
import { FaMoon } from "react-icons/fa";
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    setTheme("system");
  }
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
    >
      {theme === "dark" ? <LuSunMedium /> : <FaMoon />}
    </button>
  );
}
