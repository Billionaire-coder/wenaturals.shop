import React from 'react';
import { Shield } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { LegalContent } from "@/types/cms";

export const LegalTab = () => {
    const { cmsData, deepUpdateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const legal = (cmsData.content_pages?.legal || {}) as Partial<LegalContent>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                    <Shield className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Legal & Privacy</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Maintain your brand&apos;s regulatory integrity and trust benchmarks.</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-2">Privacy Policy</h3>
                <textarea
                    value={legal.privacy_policy || ''}
                    onChange={(e) => deepUpdateField('content_pages', 'legal', 'privacy_policy', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 h-64 resize-y focus:border-blue-500/50 focus:bg-zinc-900 transition-all outline-none"
                    placeholder="HTML or Markdown content for Privacy Policy..."
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Terms of Service</h3>
                <textarea
                    value={legal.terms_of_service || ''}
                    onChange={(e) => deepUpdateField('content_pages', 'legal', 'terms_of_service', e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-xs font-mono text-zinc-300 h-64 resize-y focus:border-blue-500/50 focus:bg-zinc-900 transition-all outline-none"
                    placeholder="HTML or Markdown content for Terms of Service..."
                />
            </div>
        </div>
    );
};
