"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlchemicalSurface } from "../ui/AlchemicalSurface";

interface FilterBarProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
    onSearchChange: (query: string) => void;
    isProcessing?: boolean;
}

export function ProductFilterBar({ categories, activeCategory, onCategoryChange, onSearchChange, isProcessing }: FilterBarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearchChange]);

    return (
        <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Categories */}
                <div className="flex flex-nowrap overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0 md:flex-wrap gap-2 no-scrollbar scroll-smooth">

                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            className="relative group"
                        >
                            <AlchemicalSurface
                                type={(activeCategory === cat ? "obsidian" : "iridescent-silk") as "obsidian" | "blue-essence" | "liquid-gold" | "iridescent-silk"}
                                className={cn(
                                    "px-5 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                    activeCategory === cat ? "text-white" : "text-zinc-500 dark:text-zinc-400 opacity-80 hover:opacity-100"
                                )}
                            >
                                {cat}
                            </AlchemicalSurface>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Search elixirs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-500"
                    />
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                    {isProcessing && (
                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-white/20 overflow-hidden rounded-full">
                            <div className="w-full h-full bg-primary animate-[loading_1s_infinite]" />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
}
