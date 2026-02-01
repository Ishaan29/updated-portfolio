"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "About", href: "#about" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Recent Activity", href: "#activity" },
    { name: "Contact", href: "#contact" },
];

export default function Navigation() {
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }

        if (latest > 50) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <motion.header
            variants={{
                visible: { y: 0 },
                hidden: { y: "-100%" },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={cn(
                "fixed top-0 z-50 w-full px-6 py-4 transition-all duration-300 md:px-12",
                scrolled
                    ? "bg-navy/85 backdrop-blur-md shadow-lg"
                    : "bg-transparent"
            )}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between">
                {/* Logo */}
                <Link href="/" className="group relative z-50">
                    <div className="text-green font-mono text-xl font-bold border-2 border-green rounded-full w-10 h-10 flex items-center justify-center hover:bg-green/10 transition-colors">
                        E
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-8 md:flex">
                    <ol className="flex gap-8">
                        {navLinks.map((link, index) => (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className="group font-mono text-sm text-lightest-slate hover:text-green transition-colors"
                                >
                                    <span className="mr-1 text-green">0{index + 1}.</span>
                                    <span className="group-hover:border-b group-hover:border-green pb-0.5 transition-all">
                                        {link.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                    <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-green px-4 py-2 font-mono text-sm text-green transition-colors hover:bg-green/10"
                    >
                        Resume
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="relative z-50 block text-green md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={32} /> : <Menu size={32} />}
                </button>

                {/* Mobile Sidebar */}
                <div
                    className={cn(
                        "fixed inset-0 z-40 flex h-screen w-full items-center justify-center bg-light-navy transition-transform duration-300 md:hidden",
                        isOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <nav className="flex flex-col items-center gap-8 text-center">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="font-mono text-lg text-lightest-slate hover:text-green"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="mb-2 text-sm text-green">0{index + 1}.</div>
                                {link.name}
                            </Link>
                        ))}
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 rounded border border-green px-8 py-4 font-mono text-lg text-green hover:bg-green/10"
                        >
                            Resume
                        </a>
                    </nav>
                </div>
            </nav>
        </motion.header>
    );
}
