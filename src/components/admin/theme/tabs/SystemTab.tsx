import React from 'react';
import { Settings } from 'lucide-react';
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";
import { SystemContent } from "@/types/cms";
import { cn } from "@/lib/utils";

export const SystemTab = () => {
    const { cmsData, updateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const system = (cmsData.content_system || {}) as Partial<SystemContent>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-zinc-500/10 rounded-xl flex items-center justify-center border border-zinc-500/20">
                    <Settings className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">System Settings</h3>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Configure global platform behavior and infrastructure states.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 flex items-center justify-between hover:bg-white/[0.04] transition-all duration-300 group">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            Maintenance Mode
                            {system.maintenance_mode && (
                                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                        </h4>
                        <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Disable public access to the platform and show an animated maintenance screen.
                        </p>
                    </div>
                    <button
                        onClick={() => updateField('content_system', 'maintenance_mode', !system.maintenance_mode)}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black",
                            system.maintenance_mode ? "bg-amber-600 shadow-[0_0_15px_-3px_rgba(217,119,6,0.5)]" : "bg-zinc-800"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300",
                                system.maintenance_mode ? "translate-x-6" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};
