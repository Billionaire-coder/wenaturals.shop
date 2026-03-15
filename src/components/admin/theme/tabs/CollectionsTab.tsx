import React from 'react';
import { LayoutTemplate, Eye, EyeOff } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { cn } from "@/lib/utils";
import { CMSField } from "../CMSField";
import { MediaListEditor } from "@/components/admin/MediaListEditor";
import { CMSMediaItem, FeaturedSection, JournalSection } from "@/types/cms";

export const CollectionsTab = () => {
    const { cmsData, updateField, toggleSectionVisibility } = useThemeEditorStore();
    if (!cmsData) return null;

    const featured = (cmsData.content_featured || {}) as Partial<FeaturedSection>;
    const journal = (cmsData.content_journal || {}) as Partial<JournalSection>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                    <LayoutTemplate className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Collections & Narrative</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Manage your featured products and editorial journal sections.</p>
                </div>
            </div>

            {/* Featured Collection */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Featured Collection</h3>
                    <button
                        onClick={() => toggleSectionVisibility('featured')}
                        className={cn("p-1 rounded-md transition-colors", featured.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {featured.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CMSField label="Subheading" section="content_featured" field="subheading" visibilityField="header_visible" />
                    <CMSField label="CTA Text" section="content_featured" field="cta_text" visibilityField="cta_visible" />
                    <CMSField label="Heading Start" section="content_featured" field="heading_start" visibilityField="categories_visible" />
                    <CMSField label="Highlight" section="content_featured" field="heading_highlight" showVisibility={false} />
                </div>

                <div className="pt-4 border-t border-white/5">
                    <MediaListEditor
                        label="Background/Decor Media"
                        media={(featured.media as CMSMediaItem[]) || []}
                        onChange={(newMedia) => updateField('content_featured', 'media', newMedia)}
                    />
                </div>
            </div>

            <div className="h-px bg-zinc-800/50" />

            {/* Ritual Journal */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Ritual Journal</h3>
                    <button
                        onClick={() => toggleSectionVisibility('journal')}
                        className={cn("p-1 rounded-md transition-colors", journal.visible !== false ? "text-blue-400 hover:bg-blue-400/10" : "text-zinc-600 hover:bg-white/5")}
                    >
                        {journal.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CMSField label="Heading Start" section="content_journal" field="heading_start" visibilityField="header_visible" />
                    <CMSField label="Highlight" section="content_journal" field="heading_highlight" showVisibility={false} />
                </div>

                <CMSField label="Subheading" section="content_journal" field="subheading" type="textarea" visibilityField="subheading_visible" />

                <div className="grid grid-cols-2 gap-4">
                    <CMSField label="CTA Text" section="content_journal" field="cta_text" visibilityField="cta_visible" />
                    <CMSField label="Tag Label (Editorial)" section="content_journal" field="tag_label" visibilityField="tag_visible" />
                </div>

                <div className="pt-4 border-t border-white/5">
                    <MediaListEditor
                        label="Background/Decor Media"
                        media={(journal.media as CMSMediaItem[]) || []}
                        onChange={(newMedia) => updateField('content_journal', 'media', newMedia)}
                    />
                </div>
            </div>
        </div>
    );
};
