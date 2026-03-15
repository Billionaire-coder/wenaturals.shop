"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    distance?: number;
    duration?: number;
}

export function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up",
    distance = 40,
    duration = 0.8
}: ScrollRevealProps) {
    const { performance, theme, isAnimationEnabled } = useEnvironment();

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    // Hard disable for ScrollReveal
    if (performance?.scroll_reveal_enabled === false) {
        return null;
    }

    const getInitialProps = () => {
        switch (direction) {
            case "up": return { y: distance, opacity: 0 };
            case "down": return { y: -distance, opacity: 0 };
            case "left": return { x: distance, opacity: 0 };
            case "right": return { x: -distance, opacity: 0 };
            case "none": return { scale: 0.9, opacity: 0 };
            default: return { y: distance, opacity: 0 };
        }
    };

    if (!isAnimationEnabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            initial={getInitialProps()}
            animate={isInView ? { x: 0, y: 0, opacity: 1, scale: 1 } : getInitialProps()}
            transition={{
                duration: duration / Math.max(0.1, theme.animationIntensity),
                delay: delay,
                ease: [0.23, 1, 0.32, 1] // Power4.easeOut
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
