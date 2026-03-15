import React from 'react';
import { Grid } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { CMSField } from "../CMSField";
import { MediaListEditor } from "@/components/admin/MediaListEditor";
import { CMSMediaItem, CategorySection } from "@/types/cms";

export const CategoriesTab = () => {
    const { cmsData, updateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const categories = (cmsData.content_categories || {}) as Partial<CategorySection>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Grid className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Category Spotlight</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Highlight your core product lines and navigational hubs.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Spotlight Settings</h3>
                    <CMSField
                        label=""
                        section="content_categories"
                        field="visible"
                        type="select"
                        showVisibility={false}
                        className="w-24"
                        options={[
                            { label: "Visible", value: "true" },
                            { label: "Hidden", value: "false" }
                        ]}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <CMSField label="Header Start" section="content_categories" field="title_start" visibilityField="header_visible" />
                    <CMSField label="Highlight" section="content_categories" field="title_highlight" showVisibility={false} />
                </div>
                <div className="pt-4 border-t border-white/5">
                    <MediaListEditor
                        label="Background/Decor Media"
                        media={(categories.media as CMSMediaItem[]) || []}
                        onChange={(newMedia) => updateField('content_categories', 'media', newMedia)}
                    />
                </div>
            </div>
        </div>
    );
};
