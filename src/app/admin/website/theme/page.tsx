"use client";

import {
    LayoutTemplate, Palette, Monitor, Smartphone,
    Save, Image as ImageIcon,
    Settings, Home, Users, FileText,
    Grid, ListOrdered, AlignLeft, Navigation,
    ShieldCheck, Zap, Megaphone, Layers, Shield,
    Type
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { DesignSystemEditor } from "@/components/admin/theme/DesignSystemEditor";
import { HeroEditor } from "@/components/admin/theme/HeroEditor";
import { HomepageCanvasManager } from "@/components/admin/theme/HomepageCanvasManager";
import { NavigationBuilder } from "@/components/admin/theme/NavigationBuilder";
import { ThemePreview } from "@/components/admin/theme/ThemePreview";
import { HistoryManager } from "@/components/admin/theme/HistoryManager";
import { Clock } from "lucide-react";

// Modular Tabs
import { AscensionTab } from "@/components/admin/theme/tabs/AscensionTab";
import { PhilosophyTab } from "@/components/admin/theme/tabs/PhilosophyTab";
import { CollectionsTab } from "@/components/admin/theme/tabs/CollectionsTab";
import { LayoutSpacingTab } from "@/components/admin/theme/tabs/LayoutSpacingTab";
import { PerformanceTab } from "@/components/admin/theme/tabs/PerformanceTab";
import { MarketingTab } from "@/components/admin/theme/tabs/MarketingTab";
import { SystemTab } from "@/components/admin/theme/tabs/SystemTab";
import { CategoriesTab } from "@/components/admin/theme/tabs/CategoriesTab";
import { ShortsTab } from "@/components/admin/theme/tabs/ShortsTab";
import { TestimonialsTab } from "@/components/admin/theme/tabs/TestimonialsTab";
import { LegalTab } from "@/components/admin/theme/tabs/LegalTab";
import { CorePagesTab } from "@/components/admin/theme/tabs/CorePagesTab";
import { MarqueeTab } from "@/components/admin/theme/tabs/MarqueeTab";





const NAVIGATION_GROUPS = [
    {
        title: "Appearance & Growth",
        tabs: [
            { id: "design", label: "Design System", icon: Palette },
            { id: "layout_spacing", label: "Layout & Spacing", icon: Grid },
            { id: "ascension", label: "Ascension Controls", icon: ShieldCheck },
            { id: "performance", label: "Performance & Eco", icon: Zap },
            { id: "marketing", label: "Marketing & SEO", icon: Megaphone },
        ]
    },
    {
        title: "Site Navigation",
        tabs: [
            { id: "header", label: "Logo & Header", icon: AlignLeft },
            { id: "nav", label: "Main Menu Builder", icon: Navigation },
            { id: "footer", label: "Footer Info", icon: Type },
        ]
    },
    {
        title: "Homepage Canvas",
        tabs: [
            { id: "layout", label: "Section Order", icon: Layers },
            { id: "hero", label: "Hero Banner", icon: Home },
            { id: "philosophy", label: "Philosophy Block", icon: Type },
            { id: "sections", label: "Collections (Shop/Blog)", icon: LayoutTemplate },
            { id: "shorts", label: "Video Gallery", icon: ImageIcon },
            { id: "categories", label: "Category Spotlight", icon: Grid },
        ]
    },
    {
        title: "Audience",
        tabs: [
            { id: "testimonials", label: "Testimonials", icon: Users },
        ]
    },
    {
        title: "Page Content",
        tabs: [
            { id: "pages", label: "Core Pages", icon: FileText },
            { id: "legal", label: "Legal & Privacy", icon: Shield },
        ]
    },
    {
        title: "System",
        tabs: [
            { id: "system", label: "System Settings", icon: Settings },
        ]
    }
];


export default function ThemePage() {

    const {
        cmsData,
        isLoading: loading,
        isSaving: saving,
        activeTab,
        setActiveTab,
        loadData,
        saveData
    } = useThemeEditorStore();



    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
    const [refreshKey, setRefreshKey] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
    const [showHistory, setShowHistory] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Broadcast CMS updates to preview iframe
    useEffect(() => {
        if (cmsData && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'CMS_UPDATE_ALL',
                data: cmsData
            }, '*');
        }
    }, [cmsData]);

    // Fetch initial data
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        const result = await saveData();
        if (result.success) {
            setRefreshKey(prev => prev + 1);
        } else {
            alert(`Failed to save changes: ${result.error || 'Unknown error'}`);
        }
    };

    // Listen for messages from the preview iframe

    // Listen for messages from the preview iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SELECT_SECTION') {
                setActiveTab(event.data.section);
            } else if (event.data?.type === 'CMS_LOAD_PREVIEW_STATE') {
                // Respond to handshake request
                if (cmsData && iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'CMS_UPDATE_ALL',
                        data: cmsData
                    }, '*');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setActiveTab, cmsData]);

    if (loading || !cmsData) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg lg:hidden text-zinc-400"
                    >
                        <ListOrdered className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hidden xs:flex">
                        <span className="text-black font-bold text-lg">W</span>
                    </div>
                    <h1 className="font-bold text-[10px] md:text-sm tracking-widest uppercase truncate">Theme Editor</h1>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* View Toggle for small screens */}
                    <div className="lg:hidden flex bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setActiveView("edit")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeView === "edit" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setActiveView("preview")}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeView === "preview" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            Live
                        </button>
                    </div>

                    <div className="bg-white/5 rounded-lg p-1 hidden sm:flex gap-1">
                        <button
                            onClick={() => setPreviewMode("desktop")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                previewMode === "desktop" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPreviewMode("mobile")}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                previewMode === "mobile" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(true)}
                            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Version History"
                        >
                            <Clock className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-white text-black px-3 md:px-6 py-2 rounded-lg font-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span className="hidden xs:inline">{saving ? "Saving..." : "Publish"}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="pt-16 flex h-screen overflow-hidden">
                {/* Sidebar Controls - Drawer on mobile, Fixed on desktop */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 w-[280px] z-40 bg-zinc-950 border-r border-white/10 transition-transform duration-300 transform lg:relative lg:translate-x-0 flex flex-col h-full",
                    isSidebarOpen ? "translate-x-0 pt-16" : "-translate-x-full"
                )}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-4">
                        <div className="space-y-6">
                            {NAVIGATION_GROUPS.map((group) => (
                                <div key={group.title} className="space-y-1 md:space-y-2">
                                    <h4 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2">
                                        {group.title}
                                    </h4>
                                    <div className="space-y-0.5">
                                        {group.tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setIsSidebarOpen(false);
                                                        setActiveView("edit");
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                                                        isActive
                                                            ? "bg-white/10 text-white shadow-lg"
                                                            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-4 h-4 transition-colors",
                                                        isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"
                                                    )} />
                                                    <span className="text-xs font-semibold tracking-wide">
                                                        {tab.label}
                                                    </span>
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="sidebar-active"
                                                            className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full"
                                                        />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Info/Footer */}
                    <div className="p-4 border-t border-white/5 bg-black/40">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                <Settings className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Editor Mode</p>
                                <p className="text-[9px] text-zinc-500 font-mono">v1.2.4-PRO</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* History Manager Overlay */}
                {showHistory && (
                    <div className="fixed inset-0 z-[60] flex justify-end">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowHistory(false)}
                        />
                        <div className="relative z-10 h-full">
                            <HistoryManager onClose={() => setShowHistory(false)} />
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar bg-black/50 transition-all duration-300",
                    activeView === "preview" ? "hidden lg:block lg:flex-1" : "block"
                )}>
                    <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 pb-32">
                        <div className="space-y-16">

                            {/* GENERAL TAB */}
                            {activeTab === "general" && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">Site Settings</h3>
                                    <p className="text-zinc-500 text-sm italic">Global site configurations like SEO defaults and analytic IDs will appear here.</p>
                                </div>
                            )}

                            {activeTab === "header" && <NavigationBuilder activeTab="header" />}

                            {/* HERO TAB */}
                            {activeTab === "hero" && <HeroEditor />}

                            {/* PHILOSOPHY TAB */}
                            {activeTab === "philosophy" && <PhilosophyTab />}

                            {/* COLLECTIONS TAB */}
                            {activeTab === "sections" && <CollectionsTab />}

                            {/* CATEGORIES TAB */}
                            {activeTab === "categories" && <CategoriesTab />}

                            {/* SHORTS TAB */}
                            {activeTab === "shorts" && <ShortsTab />}

                            {/* MARQUEE TABS */}
                            {activeTab === "marquee_top" && <MarqueeTab type="top" />}
                            {activeTab === "marquee_bottom" && <MarqueeTab type="bottom" />}


                            {/* TESTIMONIALS TAB */}
                            {activeTab === "testimonials" && <TestimonialsTab />}

                            {activeTab === "footer" && <NavigationBuilder activeTab="footer" />}

                            {/* PAGES TAB */}
                            {activeTab === "pages" && <CorePagesTab />}

                            {/* LEGAL TAB */}
                            {activeTab === "legal" && <LegalTab />}

                            {/* DESIGN TAB */}
                            {activeTab === "design" && <DesignSystemEditor />}

                            {/* LAYOUT & SPACING TAB */}
                            {activeTab === "layout_spacing" && <LayoutSpacingTab />}

                            {/* ASCENSION TAB */}
                            {activeTab === "ascension" && <AscensionTab />}

                            {/* NAVIGATION TAB */}
                            {activeTab === "nav" && <NavigationBuilder activeTab="nav" />}

                            {/* MARKETING TAB */}
                            {activeTab === "marketing" && <MarketingTab />}

                            {/* PERFORMANCE TAB */}
                            {activeTab === "performance" && <PerformanceTab />}

                            {/* LAYOUT TAB */}
                            {activeTab === "layout" && <HomepageCanvasManager />}

                            {/* SYSTEM TAB */}
                            {activeTab === "system" && <SystemTab />}

                        </div>
                    </div>
                </div>

                {/* Live Preview Panel - Right */}
                {/* Live Preview Panel - Right */}
                <ThemePreview
                    ref={iframeRef}
                    activeView={activeView}
                    previewMode={previewMode}
                    refreshKey={refreshKey}
                />
            </div >
        </div >
    );
}
