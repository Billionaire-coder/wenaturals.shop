import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { ProductDescriptionEditor } from "@/components/admin/ProductDescriptionEditor";
import { CMSField } from "../CMSField";

export const CorePagesTab = () => {
    const {
        cmsData,
        addFaqItem,
        updateFaqItem,
        removeFaqItem
    } = useThemeEditorStore();

    if (!cmsData) return null;

    const pages = cmsData.content_pages || {};

    const pageConfig = [
        { id: 'shop', label: 'Shop/Catalog', icon: FileText, desc: 'Manage catalog headers and meta.' },
        { id: 'blog', label: 'Journal/Blog', icon: FileText, desc: 'Configure the editorial archive experience.' },
        { id: 'about', label: 'Brand Story', icon: FileText, desc: 'Define your legacy and scientific origins.' },
        { id: 'contact', label: 'Concierge/Contact', icon: FileText, desc: 'Refine customer touchpoints and support.' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                    <FileText className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Core Pages</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Configure global platform behavior and infrastructure states.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pageConfig.map((page) => (
                    <div key={page.id} className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-3">
                            <page.icon className="w-4 h-4 text-zinc-500" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">{page.label}</h4>
                        </div>
                        <p className="text-[10px] text-zinc-500 italic">{page.desc}</p>

                        <div className="space-y-3">
                            <CMSField
                                label="Page Title"
                                section="content_pages"
                                field={`${page.id}.title`}
                                isDeep
                                showVisibility={false}
                            />
                            <CMSField
                                label="Caption/Sub"
                                section="content_pages"
                                field={`${page.id}.caption`}
                                isDeep
                                showVisibility={false}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Dynamic FAQ Engine */}
            <div className="space-y-6 pt-12 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Customer FAQ Engine</h3>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Build responsive knowledge bases for your clientele.</p>
                    </div>
                    <button
                        onClick={addFaqItem}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Add Entry
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {(pages.faq?.items || []).map((item: { question: string; answer: string }, i: number) => (
                        <div key={i} className="p-6 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-4 group">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter italic">Knowledge Fragment #{i + 1}</span>
                                <button
                                    onClick={() => removeFaqItem(i)}
                                    className="text-zinc-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <input
                                    value={item.question}
                                    onChange={(e) => updateFaqItem(i, 'question', e.target.value)}
                                    placeholder="Question/Concerns"
                                    className="w-full bg-transparent border-b border-white/10 text-sm px-2 py-2 focus:border-blue-500 outline-none text-white font-medium"
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-zinc-500 font-bold px-1">Response Content</label>
                                    <ProductDescriptionEditor
                                        content={item.answer}
                                        onChange={(html) => updateFaqItem(i, 'answer', html)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
