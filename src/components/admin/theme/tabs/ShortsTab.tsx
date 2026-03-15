import React from 'react';
import { Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";
import { CMSField } from "../CMSField";
import { MediaListEditor } from "@/components/admin/MediaListEditor";
import { CMSMediaItem, YoutubeShortsSection } from "@/types/cms";

export const ShortsTab = () => {
    const { cmsData, updateField, toggleSectionVisibility } = useThemeEditorStore();
    if (!cmsData) return null;

    const shorts = (cmsData.youtube_shorts || {}) as Partial<YoutubeShortsSection>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                    <ImageIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Video Shorts</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Embed immersive vertical narratives and visual alchemy.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Gallery Visibility</h3>
                    <button
                        onClick={() => toggleSectionVisibility('shorts')}
                        className={cn("p-1 rounded-md transition-colors", shorts.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {shorts.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <CMSField label="Section Header" section="youtube_shorts" field="title" visibilityField="header_visible" />
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] uppercase text-zinc-500 font-bold">Videos/Marquee</label>
                            <button
                                onClick={() => updateField('youtube_shorts', 'marquee_visible', shorts.marquee_visible === false ? true : false)}
                                className={cn("p-0.5 rounded transition-colors", shorts.marquee_visible !== false ? "text-blue-400" : "text-zinc-600")}
                            >
                                {shorts.marquee_visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">Controls the visibility of the video cards and scrolling marquee.</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                    <MediaListEditor
                        label="Background/Decor Media"
                        media={(shorts.media as CMSMediaItem[]) || []}
                        onChange={(newMedia) => updateField('youtube_shorts', 'media', newMedia)}
                    />
                </div>
            </div>
        </div>
    );
};
