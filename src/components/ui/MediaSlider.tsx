"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

export type MediaType = "image" | "video";

export interface MediaItem {
    url: string;
    type: MediaType;
    alt?: string;
}

const isVideo = (url: string) => {
    if (!url) return false;
    const extensionMatch = url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    if (extensionMatch) return true;

    // Specific Cloudinary video check
    const isCloudinaryVideo = url.includes("cloudinary.com") && url.includes("/video/upload/");
    const isExternalVideo = url.includes("vimeo.com") || url.includes("youtube.com") || url.includes("youtu.be");

    return !!(isCloudinaryVideo || isExternalVideo);
};

interface MediaSliderProps {
    media: MediaItem[];
    interval?: number;
    className?: string;
    objectFit?: "cover" | "contain";
    overlay?: boolean;
    priority?: boolean;
}

export function MediaSlider({
    media = [],
    interval = 6000,
    className,
    objectFit = "contain",
    overlay = false,
    priority = false
}: MediaSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { margin: "10%" }); // Pre-load slightly before entry

    // Filter out invalid media
    const validMedia = media.filter(item => item.url);

    useEffect(() => {
        if (validMedia.length <= 1 || !isInView) {
            return;
        }

        const currentItem = validMedia[currentIndex];
        const isCurrentVideo = currentItem?.type === "video" || (currentItem?.url && isVideo(currentItem.url));

        // If it's a video, we rely on the onEnded event of the video element
        if (isCurrentVideo) return;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % validMedia.length);
        }, interval);

        return () => clearTimeout(timer);
    }, [currentIndex, validMedia, interval, isInView]);

    // Safety: Reset index if it goes out of bounds (e.g. during real-time updates)
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (currentIndex >= validMedia.length && validMedia.length > 0) {
            timeout = setTimeout(() => setCurrentIndex(0), 0);
        }
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [validMedia.length, currentIndex]);

    if (validMedia.length === 0) {
        return <div className={cn("w-full h-full bg-zinc-900", className)} />;
    }

    return (
        <div ref={containerRef} className={cn("relative overflow-hidden w-full", className)}>
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                    if (validMedia.length <= 1) return;
                    const threshold = 50;
                    if (info.offset.x < -threshold) {
                        setCurrentIndex((prev) => (prev + 1) % validMedia.length);
                    } else if (info.offset.x > threshold) {
                        setCurrentIndex((prev) => (prev - 1 + validMedia.length) % validMedia.length);
                    }
                }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative w-full"
                    >
                        {(() => {
                            const currentItem = validMedia[currentIndex];
                            if (!currentItem) return null;

                            return currentItem.type === "video" || isVideo(currentItem.url) ? (
                                <video
                                    src={currentItem.url}
                                    autoPlay={isInView}
                                    muted
                                    loop={validMedia.length === 1}
                                    playsInline
                                    preload="none"
                                    onEnded={() => {
                                        if (validMedia.length > 1) {
                                            setCurrentIndex((prev) => (prev + 1) % validMedia.length);
                                        }
                                    }}
                                    className={cn(
                                        "w-full h-auto max-h-[80vh] rounded-[2rem]",
                                        objectFit === "cover" ? "object-cover" : "object-contain"
                                    )}
                                />
                            ) : (
                                <div className={cn(
                                    "relative w-full aspect-video md:aspect-[21/9] max-h-[80vh]",
                                    className?.includes("h-full") && "h-full aspect-auto"
                                )}>
                                    <Image
                                        src={currentItem.url}
                                        alt={currentItem.alt || "Slider Image"}
                                        fill
                                        priority={priority && currentIndex === 0}
                                        className={cn(
                                            "rounded-[2rem]",
                                            objectFit === "cover" ? "object-cover" : "object-contain"
                                        )}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                    />
                                </div>
                            );
                        })()}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {overlay && <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-[2rem] z-10" />}

            {/* Dots */}
            {validMedia.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {validMedia.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all",
                                idx === currentIndex ? "bg-white w-4" : "bg-white/30 hover:bg-white/60"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
