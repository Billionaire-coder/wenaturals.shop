import React from 'react';
import { Type } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { CMSField } from "../CMSField";
import { MediaListEditor } from "@/components/admin/MediaListEditor";
import { CMSMediaItem, PhilosophySection } from "@/types/cms";

export const PhilosophyTab = () => {
    const { cmsData, updateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const philosophy = (cmsData.content_philosophy || {}) as Partial<PhilosophySection>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                    <Type className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Philosophy Block</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Define your brand&apos;s core mission and the narrative that drives your rituals.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Section Visibility</h3>
                    <CMSField
                        label=""
                        section="content_philosophy"
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
                    <CMSField
                        label="Heading Start"
                        section="content_philosophy"
                        field="heading_start"
                        visibilityField="header_visible"
                    />
                    <CMSField
                        label="Heading Highlight"
                        section="content_philosophy"
                        field="heading_highlight"
                        showVisibility={false}
                    />
                </div>

                <CMSField
                    label="Description Text"
                    section="content_philosophy"
                    field="description"
                    type="textarea"
                    visibilityField="description_visible"
                />

                <div className="pt-4 border-t border-white/5">
                    <MediaListEditor
                        label="Philosophy Background Media"
                        media={(philosophy.media as CMSMediaItem[]) || []}
                        onChange={(newMedia) => updateField('content_philosophy', 'media', newMedia)}
                    />
                </div>
            </div>
        </div>
    );
};
