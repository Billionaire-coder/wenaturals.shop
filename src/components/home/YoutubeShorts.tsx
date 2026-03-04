"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { CMSMediaItem } from "@/types/cms";
import { MediaSlider } from "@/components/ui/MediaSlider";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";
import { useContent } from "@/hooks/useContent";

export function YoutubeShorts(props: { initialContent?: Record<string, unknown> }) {
    const { performance } = useEnvironment();
    const shortsConfig = (useContent('youtube_shorts', props.initialContent) || {}) as Record<string, unknown>;
    const [shorts, setShorts] = useState<Record<string, unknown>[]>([]);
    const [isAnyPlaying, setIsAnyPlaying] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (shortsConfig?.visible === false) return;
            if (props.initialContent) {
                const initial = props.initialContent as Record<string, unknown>;
                if (Array.isArray(initial)) {
                    setShorts(initial as Record<string, unknown>[]);
                } else if (initial.items && Array.isArray(initial.items)) {
                    setShorts(initial.items as Record<string, unknown>[]);
                } else if (initial.value && Array.isArray(initial.value)) {
                    setShorts(initial.value as Record<string, unknown>[]);
                }
                return;
            }

            const fetchShorts = async () => {
                const supabase = createClient();
                const { data } = await supabase
                    .from('site_config')
                    .select('value')
                    .eq('key', 'youtube_shorts')
                    .single();

                if (data && data.value) {
                    const val = data.value as Record<string, unknown>;
                    if (Array.isArray(val)) {
                        setShorts(val as Record<string, unknown>[]);
                    } else if (val.items && Array.isArray(val.items)) {
                        setShorts(val.items as Record<string, unknown>[]);
                    }
                }
            };
            fetchShorts();
        }, 0);
        return () => clearTimeout(timeout);
    }, [shortsConfig?.visible, props.initialContent]);

    if (shortsConfig?.visible === false) return null;
    if (shorts.length === 0) return null;

    const isMarquee = performance?.marquee_enabled !== false && shorts.length > 4;
    // For marquee, duplicate list to create seamless loop
    const displayShorts = isMarquee ? [...shorts, ...shorts] : shorts;

    return (
        <section className="py-20 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-background transition-colors duration-300">
            {/* Background Media */}
            {(shortsConfig.media as unknown as CMSMediaItem[]) && (shortsConfig.media as unknown as CMSMediaItem[]).length > 0 && (
                <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
                    <MediaSlider media={shortsConfig.media as unknown as CMSMediaItem[]} className="h-full w-full" objectFit="cover" overlay />
                </div>
            )}

            {/* CSS for Marquee Scroll */}
            <style jsx global>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll-left 40s linear infinite;
                }
                /* Hover to pause can be added if desired, but user asked for pause on click-play */
                .mask-linear-fade {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-blue-200/20 dark:bg-blue-900/5 -z-10" />
            <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-[1920px] mx-auto relative z-10">
                {(shortsConfig.header_visible !== false || shortsConfig.marquee_visible !== false) && (
                    <div className="mb-12 md:mb-16">
                        {shortsConfig.header_visible !== false && (
                            <h2 className="text-[clamp(1.75rem,8vw,4rem)] font-bold text-zinc-900 dark:text-white mb-8 tracking-tight px-4 md:px-0">
                                {shortsConfig.title as string || "Visual Alchemy."}
                            </h2>
                        )}

                        {shortsConfig.marquee_visible !== false && (
                            <div className="flex overflow-hidden py-4 border-y border-zinc-200 dark:border-white/10 glass dark:glass">
                                <motion.div
                                    animate={{ x: [0, -1000] }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="flex whitespace-nowrap gap-12 text-zinc-900 dark:text-white font-bold text-lg md:text-2xl uppercase tracking-widest"
                                >
                                    {[...Array(10)].map((_, i) => (
                                        <span key={i} className="flex items-center gap-6">
                                            <span>WE NATURALS</span>
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        </span>
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}

                {shortsConfig?.marquee_visible !== false && (
                    <>
                        {isMarquee ? (
                            // MARQUEE LAYOUT (> 4 items)
                            <div className="relative w-full overflow-hidden mask-linear-fade">
                                <div
                                    className="flex gap-8 w-max animate-scroll"
                                    style={{
                                        animationPlayState: isAnyPlaying ? 'paused' : 'running',
                                        // Adjust Speed based on count to keep consistent pace
                                        animationDuration: `${shorts.length * 8}s`
                                    }}
                                >
                                    {displayShorts.map((short, i) => (
                                        <ShortCard
                                            key={`marquee-${short.id}-${i}`}
                                            short={short}
                                            index={i}
                                            onPlay={(playing) => setIsAnyPlaying(playing)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // STATIC GRID LAYOUT (<= 4 items)
                            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                                {shorts.map((short: Record<string, unknown>, i) => (
                                    <ShortCard
                                        key={`grid-${short.id}-${i}`}
                                        short={short}
                                        index={i}
                                        onPlay={(playing) => setIsAnyPlaying(playing)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

function ShortCard({ short, index, onPlay }: { short: Record<string, unknown>, index: number, onPlay: (playing: boolean) => void }) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Helper to extract Video ID
    const getVideoId = (url: string) => {
        const match = url?.match(/(?:youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/watch\?v=)([^?&/]+)/);
        return match ? match[1] : null;
    };

    const videoId = getVideoId(short.url as string);

    const handlePlay = () => {
        setIsPlaying(true);
        onPlay(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`group relative w-[180px] md:w-[280px] aspect-[9/16] cursor-pointer transition-all duration-500 rounded-3xl ${isPlaying ? 'ring-2 ring-blue-500/80 dark:ring-blue-400/80 shadow-[0_0_60px_rgba(59,130,246,0.4)] scale-105 z-10' : 'hover:scale-105'}`}
        >
            <div className="h-full w-full overflow-hidden rounded-3xl relative bg-zinc-900/5 dark:bg-black/40 backdrop-blur-md">

                {isPlaying && videoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                        title={(short.title as string) || "YouTube video"}
                        className="absolute inset-0 w-full h-full rounded-3xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full relative" onClick={handlePlay}>
                        {(() => {
                            const s = short as Record<string, unknown>;
                            const getThumbnail = () => {
                                if (s.thumbnail && s.thumbnail !== "/placeholder.jpg" && s.thumbnail !== "") return s.thumbnail as string;
                                if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                return null;
                            };
                            const thumb = getThumbnail();

                            if (thumb) {
                                // eslint-disable-next-line @next/next/no-img-element
                                return <img src={thumb as string} alt="Short" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />;
                            }
                            return <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-700 font-bold text-xs uppercase tracking-widest">No Thumbnail</div>;
                        })()}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent " />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Play className="w-4 h-4 md:w-6 md:h-6 text-white ml-1 fill-white" />
                            </div>
                        </div>

                        {/* Content */}
                        {(() => {
                            const s = short as Record<string, unknown>;
                            const hasTitle = typeof s.title === 'string' && s.title !== '';
                            const hasViews = typeof s.views === 'string' && s.views !== '';

                            if (!hasTitle && !hasViews) return null;

                            return (
                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
                                    {hasTitle && (
                                        <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                                            {s.title as string}
                                        </h3>
                                    )}
                                    {hasViews && (
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                            <span>{s.views as string} views</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                    </div>
                )}
            </div>
        </motion.div>
    );
}
