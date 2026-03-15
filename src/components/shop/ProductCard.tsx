"use client";

import Image from "next/image";
import { Plus, X, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useCart } from "@/hooks/useCart";
import { Magnetic } from "@/components/ui/Magnetic";
import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEnvironment } from "@/components/providers/EnvironmentalProvider";
import { ExplodedViewModal, ProductVariant } from "./ExplodedViewModal";
import { PrefetchLink } from "@/components/ui/PrefetchLink";
import { AlchemicalSurface } from "@/components/ui/AlchemicalSurface";
import { Suspense } from "react";
import { ProductDynamicData } from "./ProductDynamicData";

interface ProductCardProps {
    id: string;
    name: string;
    price: string | number;
    category: string;
    image: string;
    description?: string;
    slug?: string;
    priority?: boolean;
    alchemyConfig?: {
        material?: "liquid-gold" | "obsidian" | "iridescent-silk" | "blue-essence" | "none";
        glow?: boolean;
        intensity?: number;
    };
    variants?: Record<string, unknown>[];
    media?: string[];
    marketplace?: Record<string, unknown>;
    currency?: string;
    stock?: number;
    categories?: string[];
    seo_alt_text?: string;
}

// 1. Move static helper outside component to prevent re-renders (Hardening Phase)
const ContentWrapperHelper = ({ alchemyConfig, children }: { alchemyConfig?: { material?: "liquid-gold" | "obsidian" | "iridescent-silk" | "blue-essence" | "none" }, children: React.ReactNode }) => {
    if (alchemyConfig?.material && alchemyConfig.material !== 'none') {
        return (
            <AlchemicalSurface type={alchemyConfig.material} className="h-full rounded-[2rem] p-1">
                {children}
            </AlchemicalSurface>
        );
    }
    return <>{children}</>;
};

export function ProductCard({
    id, name, price, category, image, description, slug, priority = false,
    alchemyConfig,
    variants = [], media = [], marketplace = {}, currency = 'USD', stock,
    categories = [],
    seo_alt_text
}: ProductCardProps) {
    const { addItem, triggerFly } = useCart();
    const { performance, theme } = useEnvironment();
    const isAnimationEnabled = !performance.eco_mode && theme.animationIntensity > 0;

    const [isExplodedOpen, setIsExplodedOpen] = useState(false);
    const [isSelfHovered, setIsSelfHovered] = useState(false);

    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);
    const springX = useSpring(tiltX, { stiffness: 100, damping: 20 });
    const springY = useSpring(tiltY, { stiffness: 100, damping: 20 });

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const imageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !performance.tilt_enabled || performance.eco_mode) return;
        const rect = cardRef.current.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const tiltIntensity = 15 * theme.animationIntensity;
        const tx = (x / rect.width - 0.5) * tiltIntensity;
        const ty = (y / rect.height - 0.5) * -tiltIntensity;

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
            tiltX.set(tx);
            tiltY.set(ty);
        });
    };

    const handleAddToCart = (e?: React.MouseEvent) => {
        if (stock !== undefined && stock <= 0) return; // Prevent add to cart if out of stock

        if (e && isAnimationEnabled) {
            triggerFly(e.clientX, e.clientY, image);
        }
        addItem({ id, name, price, image });
    };

    // ... (rest of methods)

    return (
        <ContentWrapperHelper alchemyConfig={alchemyConfig}>
            <motion.article
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsSelfHovered(true)}
                onMouseLeave={() => { setIsSelfHovered(false); tiltX.set(0); tiltY.set(0); }}
                initial={isAnimationEnabled ? { opacity: 0, y: 40, filter: "blur(10px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.2 / Math.max(0.1, theme.animationIntensity), ease: [0.16, 1, 0.3, 1] }}
                className="relative group cursor-pointer product-card-container"
            >
                <PrefetchLink href={`/shop/${productSlug}`} slug={productSlug} className="absolute inset-0 z-0" aria-label={`View ${name}`} />
                <SpotlightCard
                    disableTilt
                    className={cn(
                        "relative overflow-hidden transition-shadow duration-500",
                        isSelfHovered ? "shadow-[0_20px_50px_rgba(34,197,94,0.2)]" : ""
                    )}>
                    <motion.div
                        className="relative overflow-hidden rounded-xl mb-4 bg-zinc-100 dark:bg-white/5 aspect-[3/4]"
                        style={{ perspective: 1000, rotateX: springY, rotateY: springX }}
                    >
                        <div ref={imageRef} className="absolute inset-0 overflow-hidden">
                            <div className="w-full h-full relative">
                                {typeof image === 'string' && image.endsWith('.mp4') ? (
                                    <video
                                        src={image}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Image
                                        src={typeof image === 'string' ? image : "/placeholder.jpg"}
                                        alt={seo_alt_text || `${name} - Premium Natural Selection`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        priority={priority}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{ objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                        </div>
                        {/* overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 z-20">
                            <Magnetic>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
                                    disabled={stock !== undefined && stock <= 0}
                                    className={cn(
                                        "w-full py-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl",
                                        stock !== undefined && stock <= 0
                                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            : "bg-white text-black dark:bg-zinc-900 dark:text-white active:scale-95"
                                    )}
                                >
                                    {stock !== undefined && stock <= 0 ? (
                                        <>
                                            <X className="w-3 h-3" />
                                            Sold Out
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-3 h-3" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </Magnetic>
                        </div>
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                            <Magnetic>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
                                    disabled={stock !== undefined && stock <= 0}
                                    className={cn(
                                        "p-2 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-full border border-zinc-200 dark:border-white/10 transition-all",
                                        stock !== undefined && stock <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-white dark:hover:bg-white/10 active:scale-90"
                                    )}
                                    aria-label="Quick Add"
                                >
                                    <Plus className="w-4 h-4 text-zinc-900 dark:text-white" />
                                </button>
                            </Magnetic>
                            <Magnetic>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsExplodedOpen(true); }}
                                    className="p-2 bg-white/80 dark:bg-black/20 backdrop-blur-md rounded-full border border-zinc-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-90"
                                    aria-label="Quick View"
                                >
                                    <Eye className="w-4 h-4 text-zinc-900 dark:text-white" />
                                </button>
                            </Magnetic>
                        </div>
                    </motion.div>

                    <div className="space-y-2 p-4 relative z-20 pointer-events-none">
                        <div className="flex flex-wrap gap-1.5 cursor-default pointer-events-auto">
                            {(Array.isArray(categories) && categories.length > 0 ? categories : [category]).map((cat: string) => (
                                <span key={cat} className="text-emerald-600 dark:text-emerald-400 text-[8px] font-bold tracking-wider uppercase border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded-full shadow-sm">
                                    {cat}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-zinc-900 dark:text-white mt-1 pointer-events-auto">
                            <div>
                                <h3 className="text-lg font-bold leading-tight">{name}</h3>
                                <Suspense fallback={<span className="text-md font-medium opacity-50">₹{price}</span>}>
                                    <ProductDynamicData
                                        productId={id}
                                        initialPrice={price}
                                        initialStock={stock}
                                    />
                                </Suspense>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddToCart(e);
                                }}
                                disabled={stock !== undefined && stock <= 0}
                                className={cn(
                                    "p-3 rounded-full transition-all shadow-lg flex items-center justify-center z-20 relative",
                                    stock !== undefined && stock <= 0
                                        ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                                        : "bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-110 active:scale-95"
                                )}
                                aria-label="Add to cart"
                            >
                                {stock !== undefined && stock <= 0 ? <X className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </SpotlightCard >
            </motion.article >

            <ExplodedViewModal
                isOpen={isExplodedOpen}
                onClose={() => setIsExplodedOpen(false)}
                product={{
                    id,
                    name,
                    image,
                    description: description || "",
                    price,
                    variants: variants as unknown as ProductVariant[],
                    media: media.length > 0 ? media : [image],
                    marketplace,
                    currency,
                    category,
                    slug: productSlug
                }}
            />
        </ContentWrapperHelper >
    );
}
