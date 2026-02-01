"use client";

import React from "react";
import { recentActivity } from "@/lib/constants";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

export default function RecentActivity() {
    return (
        <section
            id="activity"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
            aria-label="Recent activity"
        >
            <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-navy/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-lightest-slate lg:sr-only">
                    Recent Activity
                </h2>
            </div>
            <div>
                <ul className="group/list">
                    {recentActivity.map((activity, index) => (
                        <li key={index} className="mb-12">
                            <ScrollReveal delay={index * 0.1}>
                                <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                                    <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-light-navy/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                                    <div className="z-10 sm:order-2 sm:col-span-6">
                                        <h3>
                                            <a
                                                className="inline-flex items-baseline font-medium leading-tight text-light-slate hover:text-green focus-visible:text-green group/link text-base"
                                                href={activity.links.external}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                aria-label={activity.title}
                                            >
                                                <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                                                <span>
                                                    {activity.title}
                                                    <span className="inline-block">
                                                        <ExternalLink className="ml-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none" />
                                                    </span>
                                                </span>
                                            </a>
                                        </h3>
                                        <p className="mt-2 text-sm leading-normal text-slate">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <div className="z-10 sm:order-1 sm:col-span-2">
                                        <header
                                            className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate sm:col-span-2"
                                            aria-label={activity.date}
                                        >
                                            {activity.date}
                                        </header>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
