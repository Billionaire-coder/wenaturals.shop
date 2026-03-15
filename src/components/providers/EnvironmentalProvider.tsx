"use client";

import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useTheme } from "next-themes";
import {
    useEnvironmentStore,
    AscensionSettings,
    PerformanceSettings,
    EnvTheme,
    EnvMode
} from "@/store/useEnvironmentStore";

export function EnvironmentalProvider({
    children,
    initialAscension,
    initialPerformance
}: {
    children: React.ReactNode,
    initialAscension?: AscensionSettings,
    initialPerformance?: PerformanceSettings
}) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const { setAscension, setPerformance, setTheme, setHydrated, ascension } = useEnvironmentStore();
    const performance = useEnvironmentStore(state => state.performance);
    const isHydrated = useEnvironmentStore(state => state.isHydrated);

    // Initialize state on mount if provided
    useEffect(() => {
        if (initialAscension) setAscension(initialAscension);
        if (initialPerformance) setPerformance(initialPerformance);
    }, [initialAscension, initialPerformance, setAscension, setPerformance]);

    // Load from localStorage safely after hydration
    useEffect(() => {
        const loadSavedSettings = () => {
            const savedPerf = localStorage.getItem('we_performance_settings');
            if (savedPerf) {
                try {
                    setPerformance(JSON.parse(savedPerf));
                } catch {
                    console.warn("Failed to parse saved performance settings");
                }
            }
            setHydrated(true);
        };

        setTimeout(loadSavedSettings, 0);
    }, [setPerformance, setHydrated]);

    // Persist to localStorage whenever changed (client only)
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('we_performance_settings', JSON.stringify(performance));
        }
    }, [performance, isHydrated]);

    // Handle real-time updates from admin preview
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CMS_UPDATE_ALL') {
                const newAscension = event.data.data?.content_ascension;
                if (newAscension) {
                    setAscension(newAscension);
                }
                const newPerformance = event.data.data?.content_performance;
                if (newPerformance) {
                    setPerformance(newPerformance);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setPerformance, setAscension]);

    // Initial fetch of settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const supabase = createClient();

                const { data } = await supabase
                    .from('site_config')
                    .select('key, value')
                    .in('key', ['content_ascension', 'content_performance']);

                if (data) {
                    data.forEach(item => {
                        if (item.key === 'content_ascension' && item.value) {
                            setAscension(item.value as AscensionSettings);
                        }
                        if (item.key === 'content_performance' && item.value) {
                            setPerformance(item.value as PerformanceSettings);
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to fetch environmental settings:", err);
            }
        };
        fetchSettings();
    }, [setPerformance, setAscension]);

    useEffect(() => {
        const updateTheme = () => {
            const hour = new Date().getHours();
            let newTheme: EnvTheme;

            if (hour >= 5 && hour < 9) {
                newTheme = {
                    mode: "dawn",
                    accentColor: "#f59e0b",
                    ambientOpacity: 0.08,
                    particleIntensity: 1.2,
                    windVelocity: 0.8,
                    animationIntensity: 1
                };
            } else if (hour >= 9 && hour < 17) {
                newTheme = {
                    mode: "noon",
                    accentColor: "#3b82f6",
                    ambientOpacity: 0.05,
                    particleIntensity: 1,
                    windVelocity: 1.2,
                    animationIntensity: 1
                };
            } else if (hour >= 17 && hour < 21) {
                newTheme = {
                    mode: "twilight",
                    accentColor: "#8b5cf6",
                    ambientOpacity: 0.12,
                    particleIntensity: 0.8,
                    windVelocity: 0.5,
                    animationIntensity: 1
                };
            } else {
                newTheme = {
                    mode: "midnight",
                    accentColor: isDark ? "#1e3a8a" : "#3b82f6",
                    ambientOpacity: isDark ? 0.15 : 0.05,
                    particleIntensity: 0.5,
                    windVelocity: 0.3,
                    animationIntensity: 1
                };
            }

            // Apply Manual Overrides & Multipliers from Ascension Settings
            if (ascension) {
                if (ascension.manual_chrono_mode) {
                    newTheme.mode = ascension.manual_chrono_mode;
                    const modes: Record<EnvMode, string> = {
                        dawn: "#f59e0b",
                        noon: "#3b82f6",
                        twilight: "#8b5cf6",
                        midnight: "#1e3a8a"
                    };
                    newTheme.accentColor = modes[ascension.manual_chrono_mode as EnvMode] || newTheme.accentColor;
                }

                newTheme.particleIntensity *= (ascension.particle_density ?? 1);
                newTheme.windVelocity *= (ascension.wind_velocity ?? 1);
                newTheme.animationIntensity = (ascension.animation_intensity ?? 1);
            }

            setTheme(newTheme);
        };

        updateTheme();
        const interval = setInterval(updateTheme, 60000);
        return () => clearInterval(interval);
    }, [ascension, isDark, setTheme]);

    return <>{children}</>;
}

export function useEnvironment() {
    const store = useEnvironmentStore();
    const isAnimationEnabled = store.isHydrated ? (!store.performance.eco_mode && (store.theme.animationIntensity ?? 1) > 0.01) : false;

    return {
        ...store,
        isAnimationEnabled
    };
}
