"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="flex min-h-screen flex-col justify-center px-6 py-24 md:px-12 lg:px-24 max-w-[1000px] mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <h1 className="font-mono text-green text-base md:text-lg mb-5">
                    Hi, my name is
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-light-slate mb-4 tracking-tight">
                    Eshaan Bajpai.
                </h2>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h3 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-slate mb-8 tracking-tight">
                    I build high-performance distributed systems.
                </h3>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <p className="max-w-xl text-slate text-lg leading-relaxed mb-12">
                    Backend Software Engineer specializing in distributed systems architecture and high-scale data processing. Currently pursuing Master's in Software Engineering at the University of Maryland while working at the Center for Advanced Transportation Lab.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex gap-4"
            >
                <Link
                    href="#projects"
                    className="inline-block rounded border border-green px-8 py-4 font-mono text-sm text-green transition-all hover:bg-green/10 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(100,255,218,0.2)]"
                >
                    View My Work
                </Link>
                <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded border border-slate px-8 py-4 font-mono text-sm text-slate transition-all hover:bg-slate/10 hover:-translate-y-1 hover:text-light-slate"
                >
                    Resume
                </a>
            </motion.div>
        </section>
    );
}
