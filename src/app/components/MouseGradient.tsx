"use client";

import React, { useEffect, useState } from "react";

import { useTheme } from "next-themes";

export default function MouseGradient() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
        const updateMousePosition = (ev: MouseEvent) => {
            setMousePosition({ x: ev.clientX, y: ev.clientY });
        };

        window.addEventListener("mousemove", updateMousePosition);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);

    if (!mounted) return null;

    const gradientColor = theme === "dark"
        ? "rgba(29, 78, 216, 0.15)"
        : "rgba(124, 58, 237, 0.18)";

    return (
        <div
            className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
            style={{
                background: `radial-gradient(900px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 80%)`,
                filter: "blur(90px)",
            }}
        />
    );
}
