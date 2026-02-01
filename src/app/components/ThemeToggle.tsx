"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="fixed right-6 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-lightest-navy/20 bg-navy/80 backdrop-blur-sm text-slate shadow-lg transition-all hover:scale-110 hover:text-lightest-slate lg:right-12 lg:top-12"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun size={20} className="transition-all" />
            ) : (
                <Moon size={20} className="transition-all" />
            )}
        </button>
    );
}
