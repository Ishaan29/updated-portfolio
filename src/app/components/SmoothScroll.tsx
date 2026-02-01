"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Link handling for smooth scroll
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (anchor && anchor.getAttribute("href")?.startsWith("#")) {
                const href = anchor.getAttribute("href");
                if (href === "#") return;

                e.preventDefault();
                const id = href?.slice(1);
                if (id) {
                    const element = document.getElementById(id);
                    if (element) {
                        lenis.scrollTo(element, {
                            offset: -100, // Adjust offset if header is sticky
                            duration: 1.5,
                        });
                    }
                }
            }
        };

        document.addEventListener("click", handleAnchorClick);

        return () => {
            lenis.destroy();
            document.removeEventListener("click", handleAnchorClick);
        };
    }, []);

    return <>{children}</>;
}
