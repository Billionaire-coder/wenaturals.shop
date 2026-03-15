import { create } from 'zustand';

export type EnvMode = "dawn" | "noon" | "twilight" | "midnight";

export interface EnvTheme {
    mode: EnvMode;
    accentColor: string;
    ambientOpacity: number;
    particleIntensity: number;
    windVelocity: number;
    animationIntensity: number;
}

export interface PerformanceSettings {
    eco_mode: boolean;
    particles_enabled: boolean;
    recursive_geometry_enabled: boolean;
    smooth_scroll_enabled: boolean;
    parallax_enabled: boolean;
    custom_cursor_enabled: boolean;
    tilt_enabled: boolean;
    marquee_enabled: boolean;
    scroll_reveal_enabled: boolean;
}

export interface AscensionSettings {
    manual_chrono_mode?: EnvMode;
    particle_density?: number;
    wind_velocity?: number;
    animation_intensity?: number;
    shader_intensity?: number;
    shader_speed?: number;
    glow_intensity?: number;
    recursive_depth?: number;
    recursive_speed?: number;
}

export const DEFAULT_PERFORMANCE: PerformanceSettings = {
    eco_mode: false,
    particles_enabled: true,
    recursive_geometry_enabled: true,
    smooth_scroll_enabled: true,
    parallax_enabled: true,
    custom_cursor_enabled: true,
    tilt_enabled: true,
    marquee_enabled: true,
    scroll_reveal_enabled: true
};

export const DEFAULT_THEME: EnvTheme = {
    mode: "noon",
    accentColor: "#3b82f6",
    ambientOpacity: 0.05,
    particleIntensity: 1,
    windVelocity: 1,
    animationIntensity: 1
};

interface EnvironmentState {
    theme: EnvTheme;
    ascension: AscensionSettings | null;
    performance: PerformanceSettings;
    isHydrated: boolean;
    setTheme: (theme: EnvTheme) => void;
    setAscension: (ascension: AscensionSettings | null) => void;
    setPerformance: (performance: PerformanceSettings) => void;
    setHydrated: (hydrated: boolean) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
    theme: DEFAULT_THEME,
    ascension: null,
    performance: DEFAULT_PERFORMANCE,
    isHydrated: false,
    setTheme: (theme) => set({ theme }),
    setAscension: (ascension) => set({ ascension }),
    setPerformance: (performance) => set({ performance }),
    setHydrated: (isHydrated) => set({ isHydrated })
}));
