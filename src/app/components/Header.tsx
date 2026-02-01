"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { resumeUrl } from "@/lib/constants";

const navLinks = [
    { name: "About", href: "#about" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Recent Activity", href: "#activity" },
    { name: "What Colleagues Say", href: "#colleagues" },
    { name: "Get In Touch", href: "#contact" },
];

export default function Header() {
    const [activeSection, setActiveSection] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section");
            let current = "";

            // Check if we're at the bottom of the page
            const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

            if (isAtBottom) {
                current = "contact";
            } else {
                sections.forEach((section) => {
                    const sectionTop = section.offsetTop;
                    if (window.scrollY >= sectionTop - 150) {
                        current = section.getAttribute("id") || "";
                    }
                });
            }

            setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-lightest-slate sm:text-5xl">
                    <Link href="/">Eshaan Bajpai</Link>
                </h1>
                <h2 className="mt-3 text-lg font-bold tracking-tight text-lightest-slate sm:text-xl">
                    Backend Software Engineer
                </h2>
                <p className="mt-4 max-w-xs leading-normal text-slate">
                    I build high-throughput distributed systems that scale to millions of users.
                </p>

                <nav className="nav hidden lg:block" aria-label="In-page jump links">
                    <ul className="mt-16 w-max">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className="group flex items-center py-3"
                                >
                                    <span
                                        className={cn(
                                            "mr-4 h-px transition-all duration-300",
                                            activeSection === link.href.substring(1)
                                                ? "w-16 bg-lightest-slate group-hover:w-16 group-hover:bg-lightest-slate"
                                                : "w-8 bg-slate/40 group-hover:w-12 group-hover:bg-slate"
                                        )}
                                    ></span>
                                    <span
                                        className={cn(
                                            "text-xs font-bold uppercase tracking-widest",
                                            activeSection === link.href.substring(1)
                                                ? "text-lightest-slate group-hover:text-lightest-slate"
                                                : "text-slate/40 group-hover:text-slate"
                                        )}
                                    >
                                        {link.name}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mt-8">
                    <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group inline-flex items-center gap-2 rounded-full border border-slate/20 bg-slate/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-lightest-slate transition hover:border-lightest-slate hover:bg-lightest-slate/10"
                    >
                        <FileText size={14} />
                        <span>Download Resume</span>
                    </a>
                </div>
            </div>

            <ul className="ml-1 mt-8 flex items-center gap-5 lg:mt-0" aria-label="Social media">
                <li className="mr-5 text-xs">
                    <a
                        className="block hover:text-slate"
                        href="https://github.com/Ishaan29"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="GitHub (opens in a new tab)"
                    >
                        <Github size={24} className="text-slate/40 transition hover:text-slate" />
                    </a>
                </li>
                <li className="mr-5 text-xs">
                    <a
                        className="block hover:text-slate"
                        href="https://www.linkedin.com/in/ishaanbajpai/"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="LinkedIn (opens in a new tab)"
                    >
                        <Linkedin size={24} className="text-slate/40 transition hover:text-slate" />
                    </a>
                </li>
                <li className="mr-5 text-xs">
                    <a
                        className="block hover:text-slate"
                        href="mailto:eshaangrad@gmail.com"
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label="Email (opens in a new tab)"
                    >
                        <Mail size={24} className="text-slate/40 transition hover:text-slate" />
                    </a>
                </li>
            </ul>
        </header>
    );
}
