import React from 'react';
import { ShieldCheck, Layers } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { AscensionContent } from "@/types/cms";
import { cn } from "@/lib/utils";
import { CMSField } from "../CMSField";

export const AscensionTab = () => {
    const { cmsData, updateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const ascension = (cmsData.content_ascension || {}) as Partial<AscensionContent>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Ascension Control</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the high-end digital atmosphere and biological reactions.</p>
                </div>
            </div>

            {/* Environmental Essence */}
            <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Environmental Essence</h3>
                    <span className="text-[9px] text-zinc-600 font-mono italic">Chrono-Shifting & Particle Physics</span>
                </div>

                {/* Chrono-Mode selector via CMSField essentially or custom for grid */}
                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Chrono-Mode (Manual Override)</label>
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { id: null, label: 'Auto' },
                            { id: 'dawn', label: 'Dawn' },
                            { id: 'noon', label: 'Noon' },
                            { id: 'twilight', label: 'Twilight' },
                            { id: 'midnight', label: 'Midnight' }
                        ].map((mode) => (
                            <button
                                key={String(mode.id)}
                                onClick={() => updateField('content_ascension', 'manual_chrono_mode', mode.id)}
                                className={cn(
                                    "p-2 text-[10px] uppercase font-bold border rounded-lg transition-all",
                                    ascension.manual_chrono_mode === mode.id
                                        ? "bg-white text-black border-white shadow-lg shadow-white/10"
                                        : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
                                )}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Particle Density</label>
                            <span className="text-[10px] text-zinc-400 font-mono">{ascension.particle_density || 1}x</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={ascension.particle_density || 1}
                            onChange={(e) => updateField('content_ascension', 'particle_density', parseFloat(e.target.value))}
                            className="w-full accent-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Wind Velocity</label>
                            <span className="text-[10px] text-zinc-400 font-mono">{ascension.wind_velocity || 1}x</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="3"
                            step="0.1"
                            value={ascension.wind_velocity || 1}
                            onChange={(e) => updateField('content_ascension', 'wind_velocity', parseFloat(e.target.value))}
                            className="w-full accent-white"
                        />
                    </div>
                </div>
            </div>

            {/* Material Refinement */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Material Refinement</h3>
                    <Layers className="w-3.5 h-3.5 text-zinc-600" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Glass Border Width</label>
                                <span className="text-[10px] text-zinc-400 font-mono">{ascension.glass_border_width || 1}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="4"
                                step="0.5"
                                value={ascension.glass_border_width || 1}
                                onChange={(e) => updateField('content_ascension', 'glass_border_width', parseFloat(e.target.value))}
                                className="w-full accent-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Material Viscosity</label>
                                <span className="text-[10px] text-zinc-400 font-mono">{ascension.viscosity || 1}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="3"
                                step="0.1"
                                value={ascension.viscosity || 1}
                                onChange={(e) => updateField('content_ascension', 'viscosity', parseFloat(e.target.value))}
                                className="w-full accent-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Reflection Intensity</label>
                                <span className="text-[10px] text-zinc-400 font-mono">{Math.round((ascension.reflection_intensity || 0.5) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={ascension.reflection_intensity || 0.5}
                                onChange={(e) => updateField('content_ascension', 'reflection_intensity', parseFloat(e.target.value))}
                                className="w-full accent-white"
                            />
                        </div>
                        <CMSField
                            label="Surface Finish"
                            section="content_ascension"
                            field="surface_finish"
                            type="select"
                            showVisibility={false}
                            options={[
                                { label: "Matte", value: "matte" },
                                { label: "Frosted", value: "frosted" },
                                { label: "Crystalline", value: "crystalline" },
                                { label: "Iridescent", value: "iridescent" }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Surface Shaders */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Surface Shaders</h3>
                    <span className="text-[9px] text-zinc-600 font-mono italic">Material Presence & Glow</span>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Shimmer Intensity</label>
                            <span className="text-[10px] text-zinc-400 font-mono">{Math.round((ascension.shader_intensity || 1) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={ascension.shader_intensity || 1}
                            onChange={(e) => updateField('content_ascension', 'shader_intensity', parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Shimmer Speed</label>
                            <span className="text-[10px] text-zinc-400 font-mono">{ascension.shader_speed || 1}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={ascension.shader_speed || 1}
                            onChange={(e) => updateField('content_ascension', 'shader_speed', parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Bioluminescent Glow</label>
                        <span className="text-[10px] text-zinc-400 font-mono">{Math.round((ascension.glow_intensity || 1) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.1"
                        value={ascension.glow_intensity || 1}
                        onChange={(e) => updateField('content_ascension', 'glow_intensity', parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                    />
                    <p className="text-[10px] text-zinc-600 italic">Controls the &quot;breathing&quot; intensity of GlassCards and Product Surfaces.</p>
                </div>
            </div>

            {/* Recursive Geometry */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Recursive Geometry</h3>
                    <span className="text-[9px] text-zinc-600 font-mono italic">Sacred Fractal Depth</span>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <CMSField
                        label="Fractal Depth"
                        section="content_ascension"
                        field="recursive_depth"
                        type="select"
                        showVisibility={false}
                        options={[
                            { label: "1 (Basic)", value: 1 },
                            { label: "2 (Standard)", value: 2 },
                            { label: "3 (Deep)", value: 3 },
                            { label: "4 (Microscopic)", value: 4 },
                            { label: "5 (Quantum)", value: 5 }
                        ]}
                    />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Evolution Speed</label>
                            <span className="text-[10px] text-zinc-400 font-mono">{ascension.recursive_speed || 1}x</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="4"
                            step="0.1"
                            value={ascension.recursive_speed || 1}
                            onChange={(e) => updateField('content_ascension', 'recursive_speed', parseFloat(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Animation Regulator */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Animation Regulator</h3>
                    <span className="text-[9px] text-zinc-600 font-mono italic">Global Intensity Scaling</span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Global Intensity</label>
                        <span className="text-[10px] text-zinc-400 font-mono">{Math.round((ascension.animation_intensity || 1) * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="2.5"
                        step="0.1"
                        value={ascension.animation_intensity || 1}
                        onChange={(e) => updateField('content_ascension', 'animation_intensity', parseFloat(e.target.value))}
                        className="w-full accent-green-500"
                    />
                    <p className="text-[10px] text-zinc-600 italic">Scales duration and magnitude of all kinetic elements site-wide.</p>
                </div>
            </div>
        </div>
    );
};
