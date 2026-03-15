"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";


export function SuccessAlchemyOverlay({ isOpen }: { isOpen: boolean }) {
    useEffect(() => {
        if (isOpen) {
            // Sound logic removed per user request
        }
    }, [isOpen]);

    const [particles, setParticles] = useState<{ x: number, duration: number, delay: number }[]>([]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen && particles.length === 0) {
                const newParticles = [...Array(20)].map(() => ({
                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                    duration: 3 + Math.random() * 5,
                    delay: Math.random() * 5
                }));
                setParticles(newParticles);
            } else if (!isOpen && particles.length > 0) {
                setParticles([]);
            }
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [isOpen, particles.length]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/90 backdrop-blur-3xl overflow-hidden"
                >
                    {/* Generative SVG "Phase Shift" Waves */}
                    <div className="absolute inset-0 z-0">
                        <svg className="w-full h-full opacity-30" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                            <motion.path
                                d="M0,500 Q250,450 500,500 T1000,500"
                                fill="none"
                                stroke="rgba(59, 130, 246, 0.5)"
                                strokeWidth="2"
                                animate={{
                                    d: [
                                        "M0,500 Q250,450 500,500 T1000,500",
                                        "M0,500 Q250,550 500,500 T1000,500",
                                        "M0,500 Q250,450 500,500 T1000,500"
                                    ]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>

                    {/* Gold Leaf Materialization Card */}
                    <motion.div
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="relative z-10 w-full max-w-md p-10 glass border border-yellow-500/30 text-center rounded-[2rem] shadow-[0_0_100px_rgba(234,179,8,0.2)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-[2rem]" />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                        >
                            <Check className="w-10 h-10 text-black stroke-[3]" />
                        </motion.div>

                        <h2 className="text-3xl font-black text-white mb-4 tracking-widest uppercase">The Circle Awaits</h2>
                        <p className="text-zinc-400 mb-8 leading-relaxed">Your selection has been transmuted. Welcome to the We Naturals inner circle.</p>

                        <div className="flex items-center justify-center gap-2 text-yellow-500/80 font-bold tracking-widest text-xs">
                            <Sparkles className="w-4 h-4" />
                            <span>DIVINE CONFIRMATION</span>
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </motion.div>

                    {/* Floating Ember Particles */}
                    {particles.map((particle, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            initial={{
                                x: particle.x,
                                y: typeof window !== 'undefined' ? window.innerHeight + 10 : 1000,
                                opacity: 0
                            }}
                            animate={{
                                y: -10,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: particle.duration,
                                repeat: Infinity,
                                delay: particle.delay
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
