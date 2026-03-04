"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { CMSMediaItem } from "@/types/cms";
import { createClient } from "@/lib/supabase";
import { useContent } from "@/hooks/useContent";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { MediaSlider } from "@/components/ui/MediaSlider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { AlchemicalSurface } from "@/components/ui/AlchemicalSurface";
import { RecursiveGeometry } from "@/components/ui/RecursiveGeometry";

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
    variants: Record<string, unknown>[];
    marketplace?: Record<string, unknown>;
    description: string;
    alchemy_config?: Record<string, unknown>;
    stock: number;
}

export function FeaturedCollection(props: { initialContent?: Record<string, unknown>, initialProducts?: Product[], allCategories?: string[] }) {
    const searchParams = useSearchParams();
    const isAdminPreview = searchParams.get('admin_preview') === 'true';

    const handleSelect = () => {
        if (isAdminPreview) {
            window.parent.postMessage({ type: 'SELECT_SECTION', section: 'sections' }, '*');
        }
    };

    const content = (useContent('content_featured', props.initialContent) || {}) as Record<string, unknown>;
    const [products, setProducts] = useState<Product[]>(props.initialProducts?.slice(0, 3) || []);
    const [allProducts, setAllProducts] = useState<Product[]>(props.initialProducts || []);
    const [activeCategory, setActiveCategory] = useState("Everyone");
    const [isMounted, setIsMounted] = useState(false);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Derived Categories
    const categories = useMemo(() => {
        if (props.initialProducts) {
            if (props.allCategories && props.allCategories.length > 0) {
                return ["Everyone", ...props.allCategories];
            }
            const uniqueCats = Array.from(new Set(props.initialProducts.map((p: Product) => p.category)));
            return ["Everyone", ...uniqueCats as string[]];
        }
        const uniqueCats = Array.from(new Set(allProducts.map((p: Product) => p.category)));
        return ["Everyone", ...uniqueCats as string[]];
    }, [props.initialProducts, props.allCategories, allProducts]);

    useEffect(() => {
        const timeout = setTimeout(() => setIsMounted(true), 0);

        if (props.initialProducts) {
            return;
        }

        const fetchData = async () => {
            const supabase = createClient();

            // Fetch Products with Category Name
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
    *
    `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching featured:", error);
                } else if (data) {
                    const mappedProducts = data.map((p: Product) => ({
                        ...p,
                        category: p.categories?.[0] || p.category || "Uncategorized"
                    }));

                    setAllProducts(mappedProducts);
                    setProducts(mappedProducts.slice(0, 3)); // Initial 3

                }
            } catch (err) {
                console.error("Unexpected error:", err);
            }
        };

        fetchData();
        return () => clearTimeout(timeout);
    }, [props.initialProducts, props.allCategories]);

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        if (category === "Everyone") {
            setProducts(allProducts.slice(0, 3));
        } else {
            const filtered = allProducts.filter(p =>
                p.category === category ||
                (p.categories && p.categories.includes(category))
            );
            setProducts(filtered.slice(0, 3));
        }
    };

    const { subheading, heading_start, heading_highlight, cta_text } = content as Record<string, string>;

    if (content?.visible === false) return null;
    if (!isMounted) return null;

    return (
        <section
            onClick={handleSelect}
            className={cn(
                "py-20 md:py-24 px-4 sm:px-6 bg-background relative overflow-hidden transition-colors duration-300",
                isAdminPreview && "cursor-pointer hover:ring-4 hover:ring-blue-500/50 hover:ring-inset transition-all z-50"
            )}
        >
            <RecursiveGeometry />
            {/* Background Media */}
            {(content.media as unknown as CMSMediaItem[]) && (content.media as unknown as CMSMediaItem[]).length > 0 && (
                <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
                    <MediaSlider media={content.media as unknown as CMSMediaItem[]} className="h-full w-full" objectFit="cover" overlay />
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-12 gap-8">
                    {content.header_visible !== false && (
                        <ScrollReveal direction="left">
                            <div className="space-y-2 md:space-y-4">
                                <span className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-[10px] md:text-xs block">
                                    {subheading as string}
                                </span>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
                                    {heading_start} <span className="text-gradient">{heading_highlight}</span>
                                </h2>
                            </div>
                        </ScrollReveal>
                    )}
                    {content.cta_visible !== false && (
                        <ScrollReveal direction="right" className="w-full sm:w-auto">
                            <Link href="/shop" className="block">
                                <Magnetic>
                                    <AlchemicalSurface type="blue-essence" className="rounded-full">
                                        <button className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto font-bold group transition-all text-sm">
                                            {cta_text}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </AlchemicalSurface>
                                </Magnetic>
                            </Link>
                        </ScrollReveal>
                    )}
                </div>

                {content.categories_visible !== false && (
                    <ScrollReveal direction="up" delay={0.2}>
                        <div className="mb-12 flex flex-wrap gap-4">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className="relative group"
                                >
                                    <AlchemicalSurface
                                        type={(activeCategory === cat ? "obsidian" : "iridescent-silk") as "obsidian" | "blue-essence" | "liquid-gold" | "iridescent-silk"}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                            activeCategory === cat ? "text-white scale-105 shadow-lg border-blue-500/50" : "text-zinc-600 dark:text-zinc-400 opacity-80"
                                        )}
                                    >
                                        {cat}
                                    </AlchemicalSurface>
                                </button>
                            ))}
                        </div>
                    </ScrollReveal>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 min-h-[400px]">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard
                                key={product.id}
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
                                isPeerHovered={hoveredId !== null && hoveredId !== product.id}
                                onHoverChange={(isHovered) => setHoveredId(isHovered ? product.id : null)}
                                alchemyConfig={product.alchemy_config as Record<string, unknown>}
                                stock={product.stock}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 flex items-center justify-center h-64 text-zinc-500">
                            No curated items in this category yet.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
