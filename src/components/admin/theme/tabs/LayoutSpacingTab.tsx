import React from 'react';
import { Grid } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { LayoutSpacingContent } from "@/types/cms";
import { cn } from "@/lib/utils";
import { CMSField } from "../CMSField";

export const LayoutSpacingTab = () => {
    const { cmsData, updateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const layout = (cmsData.content_layout_spacing || {}) as Partial<LayoutSpacingContent>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <Grid className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Layout & Spacing</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Orchestrate the structural rhythm and spatial harmony of your digital space.</p>
                </div>
            </div>

            {/* Section Spacing */}
            <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Structural Rhythm</h3>
                    <span className="text-[9px] text-zinc-600 font-mono italic">Padding & Alignment</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Section Padding (Y)</label>
                                <span className="text-[10px] text-zinc-400 font-mono">{layout.section_padding_y || '24'}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="120"
                                step="4"
                                value={layout.section_padding_y || 24}
                                onChange={(e) => updateField('content_layout_spacing', 'section_padding_y', parseInt(e.target.value))}
                                className="w-full accent-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Grid Gap</label>
                                <span className="text-[10px] text-zinc-400 font-mono">{layout.grid_gap || '16'}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="64"
                                step="4"
                                value={layout.grid_gap || 16}
                                onChange={(e) => updateField('content_layout_spacing', 'grid_gap', parseInt(e.target.value))}
                                className="w-full accent-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <CMSField
                            label="Container Width"
                            section="content_layout_spacing"
                            field="container_width"
                            type="select"
                            showVisibility={false}
                            options={[
                                { label: "Narrow (5xl)", value: "max-w-5xl" },
                                { label: "Standard (6xl)", value: "max-w-6xl" },
                                { label: "Default (7xl)", value: "max-w-7xl" },
                                { label: "Wide (1440px)", value: "max-w-[1440px]" },
                                { label: "Full Bleed", value: "max-w-full" }
                            ]}
                        />
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Content Alignment</label>
                            <div className="flex bg-white/5 p-1 rounded-lg">
                                {['left', 'center'].map((a) => (
                                    <button
                                        key={a}
                                        onClick={() => updateField('content_layout_spacing', 'content_alignment', a)}
                                        className={cn(
                                            "flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
                                            (layout.content_alignment || 'center') === a ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Balance Preview */}
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 flex flex-col gap-4">
                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-4">Spatial Balance Preview</div>
                <div
                    className={cn(
                        "mx-auto w-full transition-all duration-500 border border-white/10 bg-black/40 rounded-lg overflow-hidden",
                        layout.container_width || 'max-w-7xl'
                    )}
                >
                    <div
                        className="w-full bg-blue-500/10 border-b border-blue-500/20 text-[8px] flex items-center justify-center font-mono py-1"
                        style={{ height: `${layout.section_padding_y || 24}px` }}
                    >
                        PADDING-Y: {layout.section_padding_y || 24}PX
                    </div>
                    <div className="p-4 grid grid-cols-3" style={{ gap: `${layout.grid_gap || 16}px` }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-square bg-white/5 border border-white/5 rounded flex items-center justify-center text-[8px] text-zinc-500">
                                GAP: {layout.grid_gap || 16}PX
                            </div>
                        ))}
                    </div>
                    <div
                        className="w-full bg-blue-500/10 border-t border-blue-500/20 text-[8px] flex items-center justify-center font-mono py-1"
                        style={{ height: `${layout.section_padding_y || 24}px` }}
                    >
                        PADDING-Y: {layout.section_padding_y || 24}PX
                    </div>
                </div>
            </div>
        </div>
    );
};
