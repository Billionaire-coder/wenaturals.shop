"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoopingMarqueeProps {
    children: React.ReactNode;
    direction?: "ltr" | "rtl";
    speed?: number; // duration in seconds
    className?: string;
    containerClassName?: string;
    gap?: number;
}

export function LoopingMarquee({
    children,
    direction = "rtl",
    speed = 30,
    className,
    containerClassName,
    gap = 32,
}: LoopingMarqueeProps) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [contentWidth, setContentWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current || !containerRef.current) return;

        const updateWidths = () => {
            if (contentRef.current && containerRef.current) {
                setContentWidth(contentRef.current.scrollWidth);
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidths();
        window.addEventListener("resize", updateWidths);
        return () => window.removeEventListener("resize", updateWidths);
    }, [children]);

    // Only loop if content exceeds container width
    const shouldLoop = containerWidth > 0 && contentWidth > containerWidth;

    // We need at least enough clones to cover the container width + 1 full content width
    const clonesNeeded = shouldLoop ? Math.ceil(containerWidth / contentWidth) + 1 : 0;
    const finalClones = isNaN(clonesNeeded) ? 0 : clonesNeeded;

    return (
        <div
            ref={containerRef}
            className={cn("w-full overflow-hidden relative", className)}
        >
            <motion.div
                className={cn("flex w-max", !shouldLoop && "mx-auto justify-center", containerClassName)}
                style={{ gap: `${gap}px` }}
                animate={shouldLoop ? {
                    x: direction === "rtl" ? [0, -(contentWidth + gap)] : [-(contentWidth + gap), 0],
                } : { x: 0 }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {/* Original Content */}
                <div ref={contentRef} className="flex shrink-0" style={{ gap: `${gap}px` }}>
                    {children}
                </div>

                {/* Cloned Content for seamless loop */}
                {shouldLoop && [...Array(finalClones)].map((_, i) => (
                    <div key={i} className="flex shrink-0" style={{ gap: `${gap}px` }} aria-hidden="true">
                        {children}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
