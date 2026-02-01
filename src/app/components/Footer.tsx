"use client";

import React from "react";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-6 text-center text-slate text-sm font-mono">
            <div className="md:hidden mb-4">
                {/* Socials already in Contact for mobile */}
            </div>

            <a
                href="https://github.com/bchiang7/v4"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green transition-colors"
            >
                <div>Designed & Built by Eshaan Bajpai</div>
                <div className="mt-1 text-xs">Inspired by Brittany Chiang</div>
            </a>
        </footer>
    );
}
