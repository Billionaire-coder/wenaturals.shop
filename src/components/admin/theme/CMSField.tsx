import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useThemeEditorStore } from "@/hooks/useThemeEditorStore";

interface CMSFieldProps {
    label: string;
    section: string;
    field: string;
    type?: "text" | "textarea" | "number" | "color" | "select";
    placeholder?: string;
    className?: string;
    options?: { label: string; value: string | number }[];
    hint?: string;
    showVisibility?: boolean;
    visibilityField?: string;
    isDeep?: boolean;
}

export const CMSField = ({
    label,
    section,
    field,
    type = "text",
    placeholder,
    className,
    options,
    hint,
    showVisibility = true,
    visibilityField,
    isDeep
}: CMSFieldProps) => {
    const { cmsData, updateField, deepUpdateField } = useThemeEditorStore();
    if (!cmsData) return null;

    const sectionData = (cmsData as Record<string, unknown>)[section] as Record<string, unknown> || {};

    // For deep fields, the field name is a dot-notated path like "hero.title"
    // We need to resolve it to get the value
    const getValue = (obj: Record<string, unknown>, path: string): unknown => {
        return path.split('.').reduce((acc: unknown, part) => {
            if (acc && typeof acc === 'object') {
                return (acc as Record<string, unknown>)[part];
            }
            return undefined;
        }, obj);
    };

    const valueStr = isDeep ? getValue(sectionData, field) : sectionData[field];
    const value = (valueStr ?? "") as string | number;

    const isVisibleValue = visibilityField ? (isDeep ? getValue(sectionData, visibilityField) : sectionData[visibilityField]) : true;
    const isVisible = isVisibleValue !== false;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newVal = type === "number" ? parseFloat(e.target.value) : e.target.value;
        if (isDeep) {
            const parts = field.split('.');
            if (parts.length === 2) {
                const updater = deepUpdateField as (s: string, b: string, k: string, v: unknown) => void;
                updater(section, parts[0], parts[1], newVal);
            }
        } else {
            const updater = updateField as (s: string, k: string, v: unknown) => void;
            updater(section, field, newVal);
        }
    };

    const toggleVisibility = () => {
        if (!visibilityField) return;
        if (isDeep) {
            const parts = visibilityField.split('.');
            if (parts.length === 2) {
                const updater = deepUpdateField as (s: string, b: string, k: string, v: unknown) => void;
                updater(section, parts[0], parts[1], !isVisible);
            }
        } else {
            const updater = updateField as (s: string, k: string, v: unknown) => void;
            updater(section, visibilityField, !isVisible);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] uppercase text-zinc-500 font-bold">{label}</label>
                {showVisibility && visibilityField && (
                    <button
                        onClick={toggleVisibility}
                        className={cn("p-0.5 rounded transition-colors", isVisible ? "text-blue-400" : "text-zinc-600")}
                    >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>

            {type === "textarea" ? (
                <textarea
                    rows={4}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none focus:border-blue-500/50 outline-none transition-all"
                />
            ) : type === "select" ? (
                <select
                    value={value}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500/50 outline-none transition-all"
                >
                    {options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : type === "color" ? (
                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                    <input
                        type="color"
                        value={value || "#000000"}
                        onChange={handleChange}
                        className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                    />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                        {value || "#000000"}
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500/50 outline-none transition-all"
                />
            )}

            {hint && <p className="text-[9px] text-zinc-600 italic px-1">{hint}</p>}
        </div>
    );
};
