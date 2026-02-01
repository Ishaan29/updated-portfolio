"use client";

import React from "react";
import Image from "next/image";
import { projects, otherProjects } from "@/lib/constants";
import { Github, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";

export default function Projects() {
    return (
        <section
            id="projects"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
            aria-label="Selected projects"
        >
            <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-navy/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-lightest-slate lg:sr-only">
                    Projects
                </h2>
            </div>


            <div>
                <ul className="group/list">
                    {projects.map((project, index) => (
                        <li key={index} className="mb-12">
                            <ScrollReveal delay={index * 0.1}>
                                <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                                    <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-light-navy/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                                    <div className="z-10 sm:order-2 sm:col-span-6">
                                        <h3>
                                            <a
                                                className="inline-flex items-baseline font-medium leading-tight text-light-slate hover:text-green focus-visible:text-green group/link text-base"
                                                href={project.links.external || project.links.github}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                aria-label={project.title}
                                            >
                                                <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                                                <span>
                                                    {project.title}
                                                    <span className="inline-block">
                                                        {project.links.external ? (
                                                            <ExternalLink className="ml-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none" />
                                                        ) : (
                                                            <Github className="ml-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none" />
                                                        )}
                                                    </span>
                                                </span>
                                            </a>
                                        </h3>
                                        <p className="mt-2 text-sm leading-normal text-slate">
                                            {project.description}
                                        </p>
                                        <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                                            {project.tech.map((tech) => (
                                                <li key={tech} className="mr-1.5 mt-2">
                                                    <div className="flex items-center rounded-full bg-green/10 px-3 py-1 text-xs font-medium leading-5 text-green">
                                                        {tech}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="z-10 sm:order-1 sm:col-span-2">
                                        <div className="rounded border-2 border-slate/10 transition group-hover:border-slate/30 sm:order-1 sm:col-span-2 sm:translate-y-1">
                                            <div className="aspect-video w-full bg-light-navy/50 flex items-center justify-center overflow-hidden">
                                                {project.image ? (
                                                    <Image
                                                        src={project.image}
                                                        alt={`${project.title} screenshot`}
                                                        width={200}
                                                        height={112}
                                                        className="object-cover w-full h-full transition group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="text-xs text-slate">Image</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </li>
                    ))}

                    {otherProjects.map((project, index) => (
                        <li key={`other-${index}`} className="mb-12">
                            <ScrollReveal delay={(index + projects.length) * 0.1}>
                                <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                                    <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-light-navy/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                                    <div className="z-10 sm:order-2 sm:col-span-6">
                                        <h3>
                                            <a
                                                className="inline-flex items-baseline font-medium leading-tight text-light-slate hover:text-green focus-visible:text-green group/link text-base"
                                                href={project.links.github}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                aria-label={project.title}
                                            >
                                                <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"></span>
                                                <span>
                                                    {project.title}
                                                    <span className="inline-block">
                                                        <Github className="ml-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none" />
                                                    </span>
                                                </span>
                                            </a>
                                        </h3>
                                        <p className="mt-2 text-sm leading-normal text-slate">
                                            {project.description}
                                        </p>
                                        <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                                            {project.tech.map((tech) => (
                                                <li key={tech} className="mr-1.5 mt-2">
                                                    <div className="flex items-center rounded-full bg-green/10 px-3 py-1 text-xs font-medium leading-5 text-green">
                                                        {tech}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="z-10 sm:order-1 sm:col-span-2">
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
