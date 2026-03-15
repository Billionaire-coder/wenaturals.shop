import React from 'react';
import { Users, Eye, EyeOff } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";
import { CMSField } from "../CMSField";
import { MediaListEditor } from "@/components/admin/MediaListEditor";
import { CMSMediaItem, TestimonialsSection } from "@/types/cms";

export const TestimonialsTab = () => {
    const { cmsData, updateField, toggleSectionVisibility } = useThemeEditorStore();
    if (!cmsData) return null;

    const testimonials = (cmsData.content_testimonials || {}) as Partial<TestimonialsSection>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                    <Users className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Audience Voices</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Manage customer testimonials and brand trust indicators.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Section Visibility</h3>
                    <button
                        onClick={() => toggleSectionVisibility('testimonials')}
                        className={cn("p-1 rounded-md transition-colors", testimonials.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {testimonials.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <CMSField label="Heading Start" section="content_testimonials" field="heading_start" visibilityField="header_visible" />
                    <CMSField label="Highlight" section="content_testimonials" field="heading_highlight" showVisibility={false} />
                </div>
                <div className="pt-4 border-t border-white/5">
                    <MediaListEditor
                        label="Background/Decor Media"
                        media={(testimonials.media as CMSMediaItem[]) || []}
                        onChange={(newMedia) => updateField('content_testimonials', 'media', newMedia)}
                    />
                </div>
            </div>
        </div>
    );
};
