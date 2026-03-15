import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { PerformanceContent } from "@/types/cms";
import { cn } from "@/lib/utils";

export const PerformanceTab = () => {
    const { cmsData, updateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const performance = (cmsData.content_performance || {}) as Partial<PerformanceContent>;

    const toggles = [
        { id: 'particles_enabled', label: 'Atmosphere Particles', desc: 'Floating ambient particles (Canvas)' },
        { id: 'recursive_geometry_enabled', label: 'Recursive Geometry', desc: 'Background SVG fractal patterns' },
        { id: 'smooth_scroll_enabled', label: 'Smooth Scrolling', desc: 'Lenis inertial scroll smoothing' },
        { id: 'parallax_enabled', label: 'Parallax Effects', desc: 'Layered background depth shifts' },
        { id: 'custom_cursor_enabled', label: 'Custom Cursor', desc: 'Mouse-following interactive cursor' },
        { id: 'tilt_enabled', label: 'Interactive Tilt', desc: 'GSAP hover tilt on primary assets' },
        { id: 'marquee_enabled', label: 'Infinite Marquees', desc: 'Auto-scrolling video galleries' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Performance & Eco</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Optimize site speed and visual clarity. Disable heavy animations for a smoother experience.</p>
                </div>
            </div>

            {/* Global Eco Mode */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Global Eco Mode
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Instantly disable all heavy animations for maximum performance.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[8px] font-bold text-green-500/50 uppercase tracking-tighter">Active State Engine</span>
                        <button
                            onClick={() => updateField('content_performance', 'eco_mode', !performance.eco_mode)}
                            className={cn(
                                "w-12 h-6 rounded-full transition-all relative overflow-hidden",
                                performance.eco_mode ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-zinc-800"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                                performance.eco_mode ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Granular Controls</h3>

                    {toggles.map((toggle) => (
                        <div key={toggle.id} className="flex items-center justify-between group">
                            <div>
                                <p className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors">{toggle.label}</p>
                                <p className="text-[10px] text-zinc-400 italic mt-0.5">{toggle.desc}</p>
                            </div>
                            <button
                                onClick={() => updateField('content_performance', toggle.id, !performance[toggle.id as keyof PerformanceContent])}
                                className={cn(
                                    "w-10 h-5 rounded-full transition-all relative",
                                    performance[toggle.id as keyof PerformanceContent] ? "bg-blue-500" : "bg-zinc-800"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                                    performance[toggle.id as keyof PerformanceContent] ? "left-5.5" : "left-0.5"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <p className="text-[10px] text-orange-400 font-medium leading-relaxed">
                        <b>Note:</b> These settings are applied in real-time to your storefront. Eco Mode overrides granular choices.
                    </p>
                </div>
            </div>
        </div>
    );
};
