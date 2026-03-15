import React from 'react';
import { Minus, Eye, EyeOff } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { MarqueeSection } from '@/types/cms';
import { cn } from "@/lib/utils";

export const MarqueeTab = ({ type }: { type: 'top' | 'bottom' }) => {
    const { cmsData, updateField, toggleSectionVisibility } = useThemeEditorStore();
    if (!cmsData) return null;

    const fieldKey = type === 'top' ? 'content_marquee_top' : 'content_marquee_bottom';
    const marquee = (cmsData[fieldKey] || {}) as Partial<MarqueeSection>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", type === 'top' ? "bg-purple-500/10 border-purple-500/20" : "bg-pink-500/10 border-pink-500/20")}>
                    <Minus className={cn("w-6 h-6", type === 'top' ? "text-purple-400" : "text-pink-400")} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">{type === 'top' ? 'Top Marquee' : 'Bottom Marquee'}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Customize the scrolling text {type === 'top' ? 'below the Hero section' : 'above the Footer'}.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Settings</h3>
                    <button
                        onClick={() => toggleSectionVisibility(type === 'top' ? 'marquee_top' : 'marquee_bottom')}
                        className={cn("p-1 rounded-md transition-colors", marquee.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {marquee.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500">Marquee Text</label>
                        <input
                            type="text"
                            value={marquee.text || ""}
                            onChange={(e) => updateField(fieldKey, 'text', e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500">Animation Speed (s)</label>
                        <input
                            type="number"
                            value={marquee.duration || (type === 'top' ? 35 : 40)}
                            onChange={(e) => updateField(fieldKey, 'duration', parseInt(e.target.value))}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
