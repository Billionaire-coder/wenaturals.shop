"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidTextProps {
    text: string;
    className?: string;
    delay?: number;
}

import { useEnvironment } from "@/components/providers/EnvironmentalProvider";

export function LiquidText({ text, className = "", delay = 0 }: LiquidTextProps) {
    const { isAnimationEnabled } = useEnvironment();

    const words = text.split(" ");
    const isGradient = className.includes("text-gradient");
    const parentClassName = cn(
        "inline-block mb-2",
        className.replace("text-gradient", "").trim()
    );

    const wordClassName = cn(
        "mr-[0.2em] inline-block",
        isGradient && "text-gradient"
    );

    // Tier 3: Text Fiber Flattening
    // If text is too long, return static to avoid DOM node explosion (Hundreds of spans)
    if (text.length > 200) {
        return <div className={parentClassName}>{text}</div>;
    }

    // Hard Disable: Return static HTML if animations are disabled
    // This prevents any "floating" or "flicker" on mount from Framer Motion
    if (!isAnimationEnabled) {
        return (
            <div className={parentClassName}>
                {words.map((word, index) => (
                    <span key={index} className={wordClassName}>
                        {word}
                    </span>
                ))}
            </div>
        );
    }

    const container: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    const child: Variants = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(6px)",
        },
    };

    return (
        <motion.div
            className={parentClassName}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {words.map((word, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    className={wordClassName}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
