"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    width?: "fit-content" | "100%";
}

export const ScrollReveal = ({ children, delay = 0, width = "100%" }: ScrollRevealProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{
                duration: 0.4,
                delay: delay,
                ease: [0.23, 1, 0.32, 1], // snappy EaseOutQuart
            }}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
