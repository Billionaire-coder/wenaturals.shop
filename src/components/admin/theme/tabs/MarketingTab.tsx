import React from 'react';
import { Megaphone, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Image from "next/image";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { MarketingContent, AnnouncementBarContent } from "@/types/cms";

export const MarketingTab = () => {
    const { cmsData, deepUpdateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const marketing = (cmsData.content_marketing || {}) as Partial<MarketingContent>;
    const announcement = (marketing.announcement_bar || {}) as Partial<AnnouncementBarContent>;
    const seo = (marketing.seo || {}) as Partial<MarketingContent['seo']>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                    <Megaphone className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Growth & SEO</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Enhance your brand&apos;s visibility and manage conversion-focused tools.</p>
                </div>
            </div>

            {/* Announcement Bar */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Announcement Bar</h3>

                <div className="flex items-center justify-between bg-zinc-900/30 p-3 rounded-lg border border-white/5">
                    <label className="text-xs text-zinc-400">Enable Bar</label>
                    <button
                        onClick={() => deepUpdateField('content_marketing', 'announcement_bar', 'enabled', !announcement.enabled)}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        {announcement.enabled ? <Megaphone className="w-4 h-4 text-green-400" /> : <Megaphone className="w-4 h-4 text-zinc-600" />}
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Message</label>
                    <input
                        value={announcement.text || ''}
                        onChange={(e) => deepUpdateField('content_marketing', 'announcement_bar', 'text', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        placeholder="e.g., Free Shipping on Orders Over $100"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Link URL</label>
                    <div className="flex items-center gap-2">
                        <input
                            value={announcement.link || ''}
                            onChange={(e) => deepUpdateField('content_marketing', 'announcement_bar', 'link', e.target.value)}
                            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                            placeholder="/shop"
                        />
                        <ExternalLink className="w-4 h-4 text-zinc-600" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Background Color</label>
                    <div className="flex gap-4 items-center">
                        <input
                            type="color"
                            value={announcement.color || '#000000'}
                            onChange={(e) => deepUpdateField('content_marketing', 'announcement_bar', 'color', e.target.value)}
                            className="w-12 h-12 rounded-lg bg-transparent cursor-pointer border-none"
                        />
                        <div className="text-xs font-mono text-zinc-400 uppercase">{announcement.color || '#000000'}</div>
                    </div>
                </div>
            </div>

            {/* Global SEO & Meta */}
            <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Global SEO & Meta</h3>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Title Template</label>
                    <input
                        value={seo.titleTemplate || ''}
                        onChange={(e) => deepUpdateField('content_marketing', 'seo', 'titleTemplate', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        placeholder="%s | We Naturals"
                    />
                    <p className="text-[10px] text-zinc-600 italic">Use %s to represent the page title.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Default Meta Description</label>
                    <textarea
                        value={seo.defaultDescription || ''}
                        onChange={(e) => deepUpdateField('content_marketing', 'seo', 'defaultDescription', e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white min-h-[80px] resize-none"
                        placeholder="Describe your brand for search engines..."
                    />
                </div>

                {/* Google Preview */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 text-left">
                    <label className="text-[10px] uppercase text-blue-400 font-bold tracking-widest">Google Search Preview</label>
                    <div className="bg-white rounded-lg p-4 font-sans">
                        <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                            {seo.titleTemplate?.replace('%s', 'Home') || 'Home | We Naturals'}
                        </div>
                        <div className="text-[#006621] text-sm truncate flex items-center gap-1">
                            https://wenaturals.com <span className="text-[10px] transform rotate-90">›</span>
                        </div>
                        <div className="text-[#4d5156] text-sm line-clamp-2 mt-1 leading-normal">
                            {seo.defaultDescription || 'Discover the fusion of molecular science and botanical purity...'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Favicon URL (.ico/.png)</label>
                        <div className="flex items-center gap-2">
                            <input
                                value={seo.favicon || ''}
                                onChange={(e) => deepUpdateField('content_marketing', 'seo', 'favicon', e.target.value)}
                                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                placeholder="https://..."
                            />
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Apple Touch Icon URL</label>
                        <div className="flex items-center gap-2">
                            <input
                                value={seo.appleTouchIcon || ''}
                                onChange={(e) => deepUpdateField('content_marketing', 'seo', 'appleTouchIcon', e.target.value)}
                                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                                placeholder="https://..."
                            />
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-left">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Default Social Image URL</label>
                    <div className="flex items-center gap-2">
                        <input
                            value={seo.defaultImage || ''}
                            onChange={(e) => deepUpdateField('content_marketing', 'seo', 'defaultImage', e.target.value)}
                            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                            placeholder="https://..."
                        />
                        <ImageIcon className="w-4 h-4 text-zinc-600" />
                    </div>
                </div>

                {/* Social Preview */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 text-left">
                    <label className="text-[10px] uppercase text-blue-400 font-bold tracking-widest ">Social Card Preview (X/Twitter)</label>
                    <div className="bg-black rounded-2xl border border-[#2f3336] overflow-hidden max-w-sm mx-auto w-full">
                        <div className="aspect-[1.91/1] bg-zinc-900 relative">
                            {seo.defaultImage ? (
                                <Image src={seo.defaultImage} fill className="object-cover" alt="Social" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-800 text-xs text-left">Preview Image</div>
                            )}
                        </div>
                        <div className="p-3 border-t border-[#2f3336] text-left">
                            <div className="text-zinc-500 text-[11px] uppercase tracking-wider">wenaturals.com</div>
                            <div className="text-white text-sm font-bold mt-0.5 line-clamp-1">
                                {seo.titleTemplate?.replace('%s', 'Home') || 'Home | We Naturals'}
                            </div>
                            <div className="text-zinc-500 text-xs line-clamp-2 mt-0.5">
                                {seo.defaultDescription || 'No description provided.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
