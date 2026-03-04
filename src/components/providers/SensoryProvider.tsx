"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';


interface SensoryContextType {
    playChime: (intensity?: number) => void;
    playLiquid: () => void;
    playBirdChirp: (intensity?: number) => void;
    isPlaying: boolean;
    initialize: () => void;
    soundEnabled: boolean;
    toggleSound: () => void;
    reducedMotion: boolean;
}

const SensoryContext = createContext<SensoryContextType>({
    playChime: () => { },
    playLiquid: () => { },
    playBirdChirp: () => { },
    isPlaying: false,
    initialize: () => { },
    soundEnabled: true,
    toggleSound: () => { },
    reducedMotion: false,
});

export function SensoryProvider({ children }: { children: React.ReactNode }) {
    const audioContext = useRef<AudioContext | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const timeout = setTimeout(() => setReducedMotion(mediaQuery.matches), 0);

        const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => {
            clearTimeout(timeout);
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const initialize = async () => {
        if (!audioContext.current) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContext.current = new AudioContextClass();
        }
        if (audioContext.current.state === 'suspended') {
            await audioContext.current.resume();
        }
        setIsPlaying(true);
    };

    const toggleSound = () => {
        setSoundEnabled(prev => !prev);
    };

    const playChime = () => {
        if (!soundEnabled || !audioContext.current) return;
        // Placeholder for oscillator logic
        // We can re-implement simple synth here if desired
    };

    const playLiquid = () => {
        if (!soundEnabled || !audioContext.current) return;
    };

    const playBirdChirp = () => {
        if (!soundEnabled || !audioContext.current) return;
    };

    return (
        <SensoryContext.Provider value={{
            playChime,
            playLiquid,
            playBirdChirp,
            isPlaying,
            initialize,
            soundEnabled,
            toggleSound,
            reducedMotion
        }}>
            {children}
        </SensoryContext.Provider>
    );
}

export const useSensory = () => {
    const context = useContext(SensoryContext);
    return context;
};
