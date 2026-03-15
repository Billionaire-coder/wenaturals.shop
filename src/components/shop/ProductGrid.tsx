"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ProductFilterBar } from "./ProductFilterBar";
import { RecursiveGeometry } from "@/components/ui/RecursiveGeometry";

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    currency: string;
    category: string;
    categories?: string[];
    media: string[];
    image?: string;
    variants: { weight: string | number; unit: string; price: string | number }[];
    marketplace?: Record<string, string>;
    description: string;
    alchemy_config?: {
        material?: "none" | "liquid-gold" | "obsidian" | "iridescent-silk" | "blue-essence";
        glow?: boolean;
        intensity?: number;
    };
    stock: number;
}

interface ProductGridProps {
    initialProducts: Product[];
    allCategories?: string[];
}

function GridContent({ initialProducts, allCategories = [] }: ProductGridProps) {
    const searchParams = useSearchParams();
    const [allProducts] = useState<Product[]>(initialProducts);
    const [activeCategory, setActiveCategory] = useState("Everyone");
    const [searchQuery, setSearchQuery] = useState("");
    const [isHydrated, setIsHydrated] = useState(false);

    // Categories: Use passed categories OR derive from products if empty
    const categories = useMemo(() => {
        const prodCats = allProducts.flatMap((p: Product) => {
            const arr = Array.isArray(p.categories) ? p.categories : [];
            return [p.category, ...arr].filter(Boolean);
        });
        const propCats = allCategories || [];
        const uniqueNormalized = Array.from(new Set([...propCats, ...prodCats].map(c => c.trim())));
        return ["Everyone", ...uniqueNormalized.sort()];
    }, [allProducts, allCategories]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsHydrated(true);
            // Check URL param for initial category
            const catParam = searchParams.get('category');
            if (catParam && categories.includes(catParam)) {
                setActiveCategory(catParam);
            }
        }, 0);
        return () => clearTimeout(timeout);
    }, [categories, searchParams]);
    // Wait, the warning was likely about something else. Let's look at the report.
    // Actually, categories is computed from allProducts. 
    // Let's just ensure it's correct.

    // Alchemical Filtering Engine (Synchronous)
    const displayedProducts = useMemo(() => {
        return allProducts.filter(item => {
            // Category Filter
            if (activeCategory !== "Everyone") {
                const lowerCat = (activeCategory || "").toLowerCase().trim();
                const primaryMatch = (item.category || "").toLowerCase().trim() === lowerCat;
                const secondaryMatch = Array.isArray(item.categories) &&
                    item.categories.some(c => (c || "").toLowerCase().trim() === lowerCat);

                if (!primaryMatch && !secondaryMatch) return false;
            }

            // Search Filter
            if (searchQuery) {
                const q = searchQuery.toLowerCase().trim();
                const nameMatch = (item.name || "").toLowerCase().includes(q);
                const descMatch = (item.description || "").toLowerCase().includes(q);
                if (!nameMatch && !descMatch) return false;
            }

            return true;
        });
    }, [allProducts, activeCategory, searchQuery]);

    const isProcessing = false; // Sync engine is instantaneous


    if (!isHydrated) return null;

    return (
        <section className="pb-20 md:pb-24 pt-4 md:pt-6 px-4 sm:px-6 relative overflow-hidden bg-background min-h-screen">
            <RecursiveGeometry />
            <div className="max-w-7xl mx-auto relative z-10">

                <ProductFilterBar
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onSearchChange={setSearchQuery}
                    isProcessing={isProcessing}
                />

                <motion.div
                    layout
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {displayedProducts.map((product, index) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    slug={product.slug}
                                    price={product.price}
                                    currency={product.currency}
                                    category={product.category}
                                    categories={product.categories}
                                    image={product.media?.[0] || product.image || "/placeholder.jpg"}
                                    media={product.media}
                                    variants={product.variants}
                                    marketplace={product.marketplace}
                                    description={product.description}
                                    priority={index < 8}
                                    alchemyConfig={product.alchemy_config}
                                    stock={product.stock}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {displayedProducts.length === 0 && (
                    <div className="py-20 text-center text-zinc-500">
                        <p>No rituals found matching your criteria.</p>
                        <button
                            onClick={() => { setActiveCategory("Everyone"); setSearchQuery(""); }}
                            className="mt-4 text-blue-400 underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Decorative Blob */}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        </section>
    );
}

export function ProductGrid({ initialProducts, allCategories }: ProductGridProps) {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-white/5" />}>
            <GridContent initialProducts={initialProducts} allCategories={allCategories} />
        </Suspense>
    );
}
