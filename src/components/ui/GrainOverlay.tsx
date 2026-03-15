"use client";

import { useEffect, useRef } from "react";

export default function GrainOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const noiseCanvas = document.createElement('canvas');
        noiseCanvas.width = 128;
        noiseCanvas.height = 128;
        const noiseCtx = noiseCanvas.getContext('2d');
        if (!noiseCtx) return;

        const noiseData = noiseCtx.createImageData(128, 128);
        const noiseBuffer = new Uint32Array(noiseData.data.buffer);

        const generateNoise = () => {
            for (let i = 0; i < noiseBuffer.length; i++) {
                if (Math.random() < 0.1) {
                    noiseBuffer[i] = 0x1affffff;
                } else {
                    noiseBuffer[i] = 0x00000000;
                }
            }
            noiseCtx.putImageData(noiseData, 0, 0);
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            generateNoise();
            const pattern = ctx.createPattern(noiseCanvas, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            setTimeout(() => {
                animationFrameId = requestAnimationFrame(draw);
            }, 100); // 10fps is enough for subtle grain
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[9999] opacity-20 mix-blend-overlay"
        />
    );
}
