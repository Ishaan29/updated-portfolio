"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

export default function Contact() {
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, message } = formData;
        const mailtoLink = `mailto:eshaangrad@gmail.com?subject=Portfolio Contact from ${name}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
        window.location.href = mailtoLink;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <section
            id="contact"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24"
        >
            <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-navy/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-lightest-slate lg:sr-only">
                    Contact
                </h2>
            </div>
            <ScrollReveal>
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-light-slate mb-6">
                    Get In Touch
                </h2>
                <p className="text-slate text-lg mb-12">
                    I'm currently looking for backend engineering opportunities where I can
                    build scalable systems and solve complex distributed challenges. Whether
                    you have a question or just want to say hi, I'll try my best to get
                    back to you!
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="name" className="sr-only">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-light-navy text-lightest-slate px-4 py-3 rounded border border-transparent focus:border-green focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-light-navy text-lightest-slate px-4 py-3 rounded border border-transparent focus:border-green focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="message" className="sr-only">Message</label>
                        <textarea
                            name="message"
                            id="message"
                            rows={5}
                            placeholder="Message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-light-navy text-lightest-slate px-4 py-3 rounded border border-transparent focus:border-green focus:outline-none transition-colors resize-none"
                        />
                    </div>
                    <div className="text-center mt-4">
                        <button
                            type="submit"
                            className="inline-block rounded border border-green px-8 py-4 font-mono text-sm text-green transition-all hover:bg-green/10 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(100,255,218,0.2)] bg-transparent cursor-pointer"
                        >
                            Send Message
                        </button>
                    </div>
                </form>

                <div className="mt-20 flex justify-center gap-8 md:hidden">
                    <a
                        href="https://github.com/Ishaan29"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-green transition-colors"
                        aria-label="GitHub"
                    >
                        <Github size={24} />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/ishaanbajpai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate hover:text-green transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={24} />
                    </a>
                </div>
            </ScrollReveal>
        </section>
    );
}
