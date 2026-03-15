"use client";

import React, { useEffect, useRef, useState } from 'react';
// import { useScroll } from 'framer-motion';
// import { useSensory } from '@/components/providers/SensoryProvider';
import { useEnvironment } from '@/components/providers/EnvironmentalProvider';
import { useAdaptivePerformance } from "@/hooks/useAdaptivePerformance";

interface Particle {
    x: number;
    y: number;
    z: number; // Depth property
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
}

export default function AtmosphereParticles() {
    const { theme: envTheme, performance: perfSettings } = useEnvironment();
    const adaptive = useAdaptivePerformance();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef<Particle[]>([]);
    const velocityRef = useRef(0);
    const lastScrollY = useRef(0);
    const themeRef = useRef(envTheme);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        themeRef.current = envTheme;
    }, [envTheme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const init = () => {
            const count = Math.min(Math.floor((window.innerWidth / 20) * (themeRef.current?.particleIntensity || 1)), 150);
            particlesRef.current = [];
            for (let i = 0; i < count; i++) {
                const z = Math.random() * 0.5 + 0.1;
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z,
                    size: (Math.random() * 2 + 1) * z * 2,
                    speedX: (Math.random() - 0.5) * 0.5 * (themeRef.current?.windVelocity || 1) * (themeRef.current?.animationIntensity || 1) * z,
                    speedY: (Math.random() - 0.5) * 0.5 * (themeRef.current?.windVelocity || 1) * (themeRef.current?.animationIntensity || 1) * z,
                    opacity: (Math.random() * 0.5 + 0.1) * z * 1.5,
                    color: i % 2 === 0 ? (themeRef.current?.accentColor || '#3b82f6') : 'rgba(139, 92, 246, 0.4)'
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        let animationFrame: number;
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 60;

        const animate = (time: number) => {
            if (document.hidden) {
                animationFrame = requestAnimationFrame(animate);
                return;
            }

            frameCount++;
            const delta = time - lastTime;
            if (delta >= 1000) {
                fps = (frameCount * 1000) / delta;
                frameCount = 0;
                lastTime = time;

                if (fps < 45 && particlesRef.current.length > 20) {
                    particlesRef.current = particlesRef.current.slice(0, Math.floor(particlesRef.current.length * 0.8));
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentScrollY = window.scrollY;
            const targetVelocity = (currentScrollY - lastScrollY.current) * 0.15;
            velocityRef.current += (targetVelocity - velocityRef.current) * 0.1;
            lastScrollY.current = currentScrollY;

            particlesRef.current.forEach(p => {
                p.y -= velocityRef.current * p.z;
                p.x += p.speedX + (Math.sin(time * 0.001 + p.y) * 0.1 * p.z);
                p.y += p.speedY;

                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 200 * p.z) {
                    const force = (200 * p.z - distance) / (200 * p.z);
                    p.x -= dx * force * 0.03 * p.z;
                    p.y -= dy * force * 0.03 * p.z;
                }

                if (p.x < -50) p.x = canvas.width + 50;
                if (p.x > canvas.width + 50) p.x = -50;
                if (p.y < -50) p.y = canvas.height + 50;
                if (p.y > canvas.height + 50) p.y = -50;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                // Faux-Bloom Effect (0 GPU Shadow Cost)
                if (p.z > 0.4 && themeRef.current) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = themeRef.current.accentColor;
                    ctx.globalAlpha = p.opacity * 0.4;
                    ctx.fill();
                }
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    }, []);
    // Gating Logic moved to the very end of hooks to satisfy rules-of-hooks
    const isAnimationEnabled = perfSettings?.particles_enabled !== false && !adaptive.isLowEnd;

    if (!isAnimationEnabled || !isMounted) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-1000"
            style={{
                opacity: envTheme.mode === 'midnight' ? 0.3 : 0.5,
            }}
        />
    );
}
