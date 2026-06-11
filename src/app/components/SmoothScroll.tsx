"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // The /admin operator console is a dense data UI — native scrolling only.
    const disabled = pathname?.startsWith("/admin") ?? false;

    useEffect(() => {
        if (disabled) return;
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

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

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
            cancelAnimationFrame(rafId);
            lenis.destroy();
            document.removeEventListener("click", handleAnchorClick);
        };
    }, [disabled]);

    return <>{children}</>;
}
