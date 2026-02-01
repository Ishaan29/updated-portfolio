"use client";

import React from "react";
import { motion } from "framer-motion";
import { techStack, availabilityStatus } from "@/lib/constants";
import ScrollReveal from "./ScrollReveal";

export default function About() {
    return (
        <section
            id="about"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
            aria-label="About me"
        >
            <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-navy/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-lightest-slate lg:sr-only">
                    About
                </h2>
            </div>
            <ScrollReveal>
                <div>
                    <div className="mb-6 flex items-center">
                        <div className="group relative flex items-center gap-2 rounded-full bg-green/10 px-4 py-2 text-xs font-medium leading-5 text-green border border-green/20 hover:border-green/40 transition-colors">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green"></span>
                            </span>
                            {availabilityStatus}
                        </div>
                    </div>
                    <div className="space-y-4 text-slate leading-relaxed">
                        <p>
                            I'm a backend engineer who obsesses over system performance, reliability, and scale.
                        </p>
                        <p>
                            Currently finishing my Masters in Software Engineering at the <span className="text-green">University of Maryland</span> while building transit data infrastructure at the <span className="text-green">Center for Advanced Transportation Lab</span>.
                        </p>
                        <p>
                            Previously at <span className="text-green">Velotio</span> and <span className="text-green">Gainsight</span>, I've:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <span className="text-green mt-1">→</span>
                                <span>Architected event-driven systems handling 100,000+ events/sec with sub-ms latency</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green mt-1">→</span>
                                <span>Built notification infrastructure serving millions of users</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green mt-1">→</span>
                                <span>Developed RAG-based analytics pipelines processing terabytes of data</span>
                            </li>
                        </ul>
                        <p>
                            I'm drawn to hard problems in distributed systems, real-time processing, and ML infrastructure—and I'm looking for teams pushing the boundaries of what's possible at scale.
                        </p>
                    </div>

                    <div className="mt-8">
                        <p className="mb-4 text-slate">Here are a few technologies I’ve been working with recently:</p>
                        <ul className="grid grid-cols-2 gap-2 text-sm font-mono text-slate w-[80%]">
                            {[
                                "Java",
                                "Spring Boot",
                                "Kafka",
                                "AWS",
                                "Docker",
                                "Microservices",
                                "PostgreSQL",
                                "Redis"
                            ].map((tech) => (
                                <li key={tech} className="flex items-center gap-2">
                                    <span className="text-green text-xs">▹</span>
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
}
