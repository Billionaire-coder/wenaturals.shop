"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ProductFilterBar } from "./ProductFilterBar";

interface Product {
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
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialProducts);
    const [activeCategory, setActiveCategory] = useState("Everyone");
    const [searchQuery, setSearchQuery] = useState("");
    const [isHydrated, setIsHydrated] = useState(false);

    // Categories: Use passed categories OR derive from products if empty
    const categories = useMemo(() => {
        if (allCategories.length > 0) return ["Everyone", ...allCategories];
        const unique = Array.from(new Set(allProducts.map((p: Product) => p.category)));
        return ["Everyone", ...unique.sort() as string[]];
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

    // Filtering Logic
    useEffect(() => {
        const timeout = setTimeout(() => {
            let filtered = allProducts;

            if (activeCategory !== "Everyone") {
                // Updated filtering to support multi-category array
                filtered = filtered.filter(p =>
                    p.category === activeCategory ||
                    (p.categories && p.categories.includes(activeCategory))
                );
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
                );
            }

            setDisplayedProducts(filtered);
        }, 0);
        return () => clearTimeout(timeout);
    }, [activeCategory, searchQuery, allProducts]);


    if (!isHydrated) return null;

    return (
        <section className="py-12 px-6 relative overflow-hidden bg-mesh min-h-screen">
            <div className="max-w-7xl mx-auto">

                <ProductFilterBar
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onSearchChange={setSearchQuery}
                />

                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {displayedProducts.map((product, index) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    slug={product.slug}
                                    price={product.price}
                                    currency={product.currency}
                                    category={product.category}
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
