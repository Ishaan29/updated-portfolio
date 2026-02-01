"use client";

import React from "react";
import { testimonials } from "@/lib/constants";
import ScrollReveal from "./ScrollReveal";

export default function Testimonials() {
    return (
        <section
            id="colleagues"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
            aria-label="What Colleagues Say"
        >
            <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-navy/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-lightest-slate lg:sr-only">
                    What Colleagues Say
                </h2>
            </div>

            <div>
                <ul className="group/list">
                    {testimonials.map((testimonial, index) => (
                        <li key={index} className="mb-12">
                            <ScrollReveal delay={index * 0.1}>
                                <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                                    <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-light-navy/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>

                                    <div className="z-10 sm:col-span-8">
                                        <div className="flex items-center gap-4 mb-4">
                                            {/* Avatar or Placeholder */}
                                            <div className="h-12 w-12 rounded-full border-2 border-slate/20 bg-slate/10 flex-shrink-0 overflow-hidden">
                                                {/* In a real scenario, we'd use testimonial.image if available */}
                                                <div className="w-full h-full bg-light-navy flex items-center justify-center text-light-slate font-bold uppercase text-lg">
                                                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-medium leading-snug text-lightest-slate text-base">
                                                    {testimonial.name}
                                                </h3>
                                                <p className="text-sm text-slate">
                                                    {testimonial.role} at {testimonial.company}
                                                </p>
                                                <p className="text-xs text-slate/60 mt-0.5">
                                                    {testimonial.connection}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-sm leading-relaxed text-slate italic">
                                            "{testimonial.text}"
                                        </div>
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
