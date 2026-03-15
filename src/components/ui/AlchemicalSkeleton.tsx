"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function AlchemicalSkeleton({ className }: SkeletonProps) {
    return (
        <div className={cn(
            "relative overflow-hidden bg-white/5 dark:bg-zinc-900/40 rounded-2xl border border-white/10",
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
            className
        )} />
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <AlchemicalSkeleton className="aspect-square" />
                    <AlchemicalSkeleton className="h-4 w-3/4" />
                    <AlchemicalSkeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export function FeaturedSectionSkeleton() {
    return (
        <section className="py-20 md:py-24 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex justify-between items-end">
                    <div className="space-y-4">
                        <AlchemicalSkeleton className="h-4 w-24" />
                        <AlchemicalSkeleton className="h-12 w-96" />
                    </div>
                    <AlchemicalSkeleton className="h-10 w-32 rounded-full" />
                </div>
                <div className="flex gap-4">
                    {[...Array(4)].map((_, i) => (
                        <AlchemicalSkeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                </div>
                <ProductGridSkeleton />
            </div>
        </section>
    );
}
