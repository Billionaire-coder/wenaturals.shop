"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Wand2, Minus, Plus as PlusIcon, ArrowLeft, ShoppingCart, Share2, Star, Maximize2, ZoomIn, ZoomOut, PlayCircle, MessageSquare, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shop/ProductCard";
import { createClient } from "@/lib/supabase";
import { LoopingMarquee } from "@/components/ui/LoopingMarquee";

const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|quicktime)$/i) || (url.includes("cloudinary.com") && url.includes("/video/"));
};

// Video-aware Media Viewer
const MediaViewer = ({ src, alt, className, onVideoEnd, onClick, isFullscreen = false }: {
    src: string,
    alt: string,
    className?: string,
    onVideoEnd?: () => void,
    onClick?: () => void,
    isFullscreen?: boolean
}) => {
    if (isVideo(src)) {
        return (
            <video
                src={src}
                controls={isFullscreen}
                className={cn(className, onClick && "cursor-pointer")}
                playsInline
                loop={false}
                muted={!isFullscreen}
                autoPlay
                onEnded={onVideoEnd}
                onClick={onClick}
            />
        );
    }
    return (
        <div className={cn("relative w-full h-full", onClick && "cursor-pointer")} onClick={onClick}>
            <Image
                src={src}
                alt={alt}
                fill
                className={cn(className, "object-contain")}
                priority
            />
            {!isFullscreen && (
                <div className="absolute top-4 right-4 p-2 rounded-full glass bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
};

interface Variant {
    weight: string;
    unit: string;
    price: string;
}

interface BundleItem {
    name: string;
    quantity: number;
    price: number;
}

interface Marketplace {
    amazon?: string;
    flipkart?: string;
    meesho?: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number | string;
    currency: string;
    stock: number;
    category: string;
    media: string[];
    variants?: Variant[];
    rarity_level?: string;
    status?: string;
    batch_info?: string;
    marketplace?: Marketplace;
    is_bundle?: boolean;
    bundle_items?: BundleItem[];
    lore_sections?: { id: string; title: string; content: string }[];
    categories?: string[];
    amazon_link?: string;
    flipkart_link?: string;
    meesho_link?: string;
    fake_ratings?: {
        "1": number;
        "2": number;
        "3": number;
        "4": number;
        "5": number;
    };
    fake_review_name?: string;
    fake_review_comment?: string;
    fake_reviews?: { name: string; comment: string; date?: string; rating?: number }[];
}

export interface RelatedBlog {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    excerpt: string;
    readTime?: string;
}

export interface RecommendedProduct {
    id: string;
    name: string;
    slug: string;
    media: string[];
    image?: string;
    price: number | string;
    currency: string;
    category: string;
    categories?: string[];
}

interface RealReview {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string;
    order_id?: string;
    profiles?: { full_name: string | null };
    is_featured: false;
    featured_name: null;
}

interface FakeReview {
    id: string;
    featured_name: string;
    comment: string;
    rating: number;
    is_featured: true;
    created_at: string;
    profiles?: never; // Explicitly no profiles for fakes
}

type Review = RealReview | FakeReview;

export default function ProductDetails({
    product,
    relatedBlogs,
    recommendedProducts = []
}: {
    product: Product,
    relatedBlogs: RelatedBlog[],
    recommendedProducts?: RecommendedProduct[]
}) {
    const router = useRouter();
    const { addItem, toggleCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [activeLoreSection, setActiveLoreSection] = useState(0);
    const [isLoreExpanded, setIsLoreExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const loreRef = useRef<HTMLDivElement>(null);
    const [quantity, setQuantity] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomScale, setZoomScale] = useState(1);

    useEffect(() => {
        if (loreRef.current) {
            // Check scrollHeight against current container or a fixed limit
            setNeedsTruncation(loreRef.current.scrollHeight > 480);
        }
        setIsLoreExpanded(false);
    }, [activeLoreSection, product.lore_sections, product.description]);

    // Review state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [eligibility, setEligibility] = useState<{ canReview: boolean; orderId?: string }>({ canReview: false });
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [stats, setStats] = useState({
        average: 0,
        total: 0,
        distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } as Record<string, number>
    });

    const supabase = createClient();

    const fetchReviewData = async () => {
        // Fetch Real Reviews
        const { data: realReviews } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .eq('product_id', product.id)
            .eq('is_visible', true)
            .order('created_at', { ascending: false });

        const mappedRealReviews: RealReview[] = (realReviews || []).map(r => ({
            ...r,
            is_featured: false as const,
            featured_name: null
        }));

        const allReviews: Review[] = [...mappedRealReviews];

        // Add Featured Fake Reviews if they exist
        if (product.fake_reviews && Array.isArray(product.fake_reviews) && product.fake_reviews.length > 0) {
            const fakes: FakeReview[] = product.fake_reviews.map((fr: { name: string; comment: string; date?: string; rating?: number }, idx: number) => ({
                id: `featured-${idx}`,
                featured_name: fr.name,
                comment: fr.comment,
                rating: fr.rating || 5,
                is_featured: true as const,
                created_at: fr.date || new Date().toISOString()
            }));
            allReviews.unshift(...fakes);
        } else if (product.fake_review_name && product.fake_review_comment) {
            // Fallback for legacy single featured review
            allReviews.unshift({
                id: 'alchemist-featured',
                featured_name: product.fake_review_name,
                comment: product.fake_review_comment,
                rating: 5,
                is_featured: true as const,
                created_at: new Date().toISOString()
            } as FakeReview);
        }

        setReviews(allReviews);

        // Calculate Stats
        const dist: Record<string, number> = { ... (product.fake_ratings || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }) };

        // Add fake review ratings to distribution
        if (product.fake_reviews && Array.isArray(product.fake_reviews)) {
            product.fake_reviews.forEach((fr: { rating?: number }) => {
                const r = fr.rating || 5;
                dist[r.toString()] = (dist[r.toString()] || 0) + 1;
            });
        } else if (product.fake_review_name && product.fake_review_comment) {
            dist["5"] = (dist["5"] || 0) + 1;
        }

        (realReviews || []).forEach((r: { rating: number }) => {
            const ratingStr = r.rating.toString();
            dist[ratingStr] = (dist[ratingStr] || 0) + 1;
        });

        const totalCount = Object.values(dist).reduce((a: number, b: number) => a + b, 0);
        const totalPoints = Object.entries(dist).reduce((acc, [star, count]) => acc + (parseInt(star) * (count as number)), 0);
        const avg = totalCount > 0 ? totalPoints / totalCount : 0;

        setStats({
            average: avg,
            total: totalCount,
            distribution: dist
        });
    };

    const checkEligibility = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check for delivered orders of this product
        const { data: eligibleOrders } = await supabase
            .from('orders')
            .select('id, status, order_items(product_id)')
            .eq('user_id', user.id)
            .eq('status', 'delivered') as { data: { id: string; status: string; order_items: { product_id: string }[] }[] | null };

        const orderWithProduct = eligibleOrders?.find((o: { order_items: { product_id: string }[] }) =>
            o.order_items.some((oi: { product_id: string }) => oi.product_id === product.id)
        );

        if (orderWithProduct) {
            // Check if already reviewed for this order
            const { data: existingReview } = await supabase
                .from('reviews')
                .select('id')
                .eq('user_id', user.id)
                .eq('order_id', orderWithProduct.id)
                .eq('product_id', product.id)
                .single();

            if (!existingReview) {
                setEligibility({ canReview: true, orderId: orderWithProduct.id });
            }
        }
    };

    useEffect(() => {
        fetchReviewData();
        checkEligibility();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]);

    // Set default variant
    useEffect(() => {
        if (product.variants && product.variants.length > 0) {
            setTimeout(() => setSelectedVariant(product.variants![0]), 0);
        }
    }, [product.variants]);

    // Intelligent Auto-swipe logic
    useEffect(() => {
        if (!product.media || product.media.length <= 1) return;

        // If current media is a video, don't set a timer. 
        // We'll use the onVideoEnd callback to progress.
        if (isVideo(product.media[selectedImage])) return;

        const interval = setInterval(() => {
            setSelectedImage((prev) => (prev + 1) % product.media.length);
        }, 8000); // 8 seconds for static images

        return () => clearInterval(interval);
    }, [product.media, selectedImage, setSelectedImage]);


    const handleVideoEnd = () => {
        if (product.media.length > 1) {
            setSelectedImage((prev) => (prev + 1) % product.media.length);
        }
    };

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out ${product.name} on We Naturals`,
                    text: `I found this amazing ${product.name} on We Naturals!`,
                    url: window.location.href,
                });
            } catch {
                // Error sharing silently fails or handled by UI
            }
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        } else {
            // Last resort fallback
            alert("Sharing not supported on this browser. You can copy the URL from the address bar.");
        }
    };

    if (!product) return null;

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 pb-20">


            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Shop
                </button>

                {/* Product Header - Full Width Top */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {(product.categories && product.categories.length > 0 ? product.categories : [product.category]).map((cat) => (
                            <span key={cat} className="px-3 py-1 rounded-full glass border-black/5 dark:border-white/10 text-[9px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                                {cat}
                            </span>
                        ))}
                        {product.rarity_level && product.rarity_level !== "Common" && (
                            <span className={cn(
                                "px-3 py-1 rounded-full border text-[10px] uppercase tracking-widest font-black",
                                product.rarity_level === "Rare" && "border-blue-500/50 text-blue-400 bg-blue-500/10",
                                product.rarity_level === "Epic" && "border-purple-500/50 text-purple-400 bg-purple-500/10",
                                product.rarity_level === "Legendary" && "border-amber-500/50 text-amber-400 bg-amber-500/10",
                                product.rarity_level === "Transcendent" && "border-cyan-400 text-cyan-400 bg-cyan-400/20 animate-pulse"
                            )}>
                                {product.rarity_level}
                            </span>
                        )}
                        {product.status === "Low Stock" && (
                            <span className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                                Low Stock
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-bold text-zinc-900 dark:text-white leading-[1.1] tracking-tight">{product.name}</h1>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 text-sm pb-2">
                            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "w-4 h-4",
                                            i < Math.round(stats.average) ? "fill-current" : "text-zinc-300 dark:text-zinc-700 font-light"
                                        )}
                                    />
                                ))}
                                <span className="text-zinc-500 ml-1">({stats.average.toFixed(1)}) • {stats.total} Reviews</span>
                            </div>
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors group"
                                title="Share this product"
                            >
                                <Share2 className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Media Gallery (Left Column) */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(_, info) => {
                                    if (product.media.length <= 1) return;
                                    const threshold = 50;
                                    if (info.offset.x < -threshold) {
                                        setSelectedImage((prev) => (prev + 1) % product.media.length);
                                    } else if (info.offset.x > threshold) {
                                        setSelectedImage((prev) => (prev - 1 + product.media.length) % product.media.length);
                                    }
                                }}
                                className="aspect-square relative rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/10 glass dark:bg-white/5 group cursor-grab active:cursor-grabbing"
                            >
                                <MediaViewer
                                    src={product.media[selectedImage] || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                    onVideoEnd={handleVideoEnd}
                                    onClick={() => setIsFullscreen(true)}
                                />
                            </motion.div>
                            {product.media.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {product.media.map((_, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all duration-300",
                                                selectedImage === idx
                                                    ? "bg-blue-600 w-8"
                                                    : "bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-700"
                                            )}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 pt-4">
                            <div className="text-4xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tighter">
                                {product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : product.currency === 'INR' ? '₹' : product.currency === 'JPY' ? '¥' : ''}{currentPrice}
                            </div>
                            {product.batch_info && (
                                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
                                    Batch Ref: <span className="text-zinc-600 dark:text-zinc-400">{product.batch_info}</span>
                                </div>
                            )}
                        </div>

                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black">Select Experience</label>
                                    {selectedVariant && (
                                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{selectedVariant.weight}{selectedVariant.unit} Selected</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {product.variants.map((variant, idx: number) => {
                                        const isSelected = selectedVariant && selectedVariant.weight === variant.weight && selectedVariant.unit === variant.unit;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={cn(
                                                    "px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all relative overflow-hidden group",
                                                    isSelected
                                                        ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                                        : "bg-white dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:border-blue-500/50"
                                                )}
                                            >
                                                {variant.weight}{variant.unit}
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="variant-bg"
                                                        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center glass border border-zinc-200 dark:border-white/10 rounded-2xl p-1 shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-mono font-bold text-zinc-900 dark:text-white">
                                    {quantity.toString().padStart(2, '0')}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                disabled={product.stock <= 0}
                                onClick={() => {
                                    const cartItem = selectedVariant ? {
                                        id: `${product.id}-${selectedVariant.weight}${selectedVariant.unit}`,
                                        name: `${product.name} - ${selectedVariant.weight}${selectedVariant.unit}`,
                                        price: typeof selectedVariant.price === 'string' ? parseFloat(selectedVariant.price) : selectedVariant.price,
                                        image: product.media?.[0] || "/placeholder.jpg",
                                        quantity: quantity
                                    } : {
                                        id: product.id,
                                        name: product.name,
                                        price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price),
                                        image: product.media?.[0] || "/placeholder.jpg",
                                        quantity: quantity
                                    };
                                    addItem(cartItem);
                                    toggleCart();
                                }}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn",
                                    product.stock > 0
                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-[1.02] active:scale-95 shadow-2xl"
                                        : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                                )}
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/20 group-hover/btn:h-full transition-all duration-500" />
                                {product.stock > 0 ? (
                                    <>
                                        <ShoppingCart className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">Add to Cart</span>
                                    </>
                                ) : (
                                    <>
                                        <X className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">Out of Stock</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Marketplace Links */}
                        {(product.amazon_link || product.flipkart_link || product.meesho_link) && (
                            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 space-y-4">
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Package className="w-4 h-4" />
                                    Available On
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {product.amazon_link && (
                                        <a
                                            href={product.amazon_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-xl glass border border-zinc-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            Amazon
                                        </a>
                                    )}
                                    {product.flipkart_link && (
                                        <a
                                            href={product.flipkart_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-xl glass border border-zinc-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            Flipkart
                                        </a>
                                    )}
                                    {product.meesho_link && (
                                        <a
                                            href={product.meesho_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-xl glass border border-zinc-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            Meesho
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Lore Section (Right Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="space-y-8"
                    >

                        {/* Lore Sections Integrated into Right Column */}
                        <div className="mt-4 space-y-8 pt-8 border-t border-zinc-200 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <Wand2 className="w-5 h-5 text-blue-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">The Botanical Source</h3>
                            </div>

                            {(product.lore_sections && product.lore_sections.length > 0) ? (
                                <div className="space-y-6">
                                    {/* Navigation - Horizontal Pill Tabs for compact view */}
                                    <div className="flex flex-wrap gap-2">
                                        {product.lore_sections.map((section, idx) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveLoreSection(idx)}
                                                className={cn(
                                                    "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                                    activeLoreSection === idx
                                                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                                        : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-white/5 hover:border-blue-500/30"
                                                )}
                                            >
                                                {section.title}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Content Panel - All sections rendered for indexing, visibility handled by CSS */}
                                    <div className="glass dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                                        {product.lore_sections.map((section, idx) => (
                                            <div
                                                key={section.id}
                                                className={cn(
                                                    "transition-all duration-500",
                                                    activeLoreSection === idx ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 -z-10 pointer-events-none h-0 overflow-hidden"
                                                )}
                                            >
                                                <motion.div
                                                    initial={false}
                                                    animate={activeLoreSection === idx ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                                    transition={{ duration: 0.4 }}
                                                    className={cn(
                                                        "relative",
                                                        (activeLoreSection === idx && !isLoreExpanded) && "max-h-[480px] overflow-hidden"
                                                    )}
                                                >
                                                    <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4 border-b border-zinc-200 dark:border-white/5 pb-2">
                                                        {section.title}
                                                    </h4>
                                                    <div
                                                        className="prose prose-sm prose-zinc dark:prose-invert leading-relaxed text-zinc-600 dark:text-zinc-400
                                                            [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-zinc-200 dark:[&_iframe]:border-white/5 [&_iframe]:w-full [&_iframe]:aspect-video"
                                                        dangerouslySetInnerHTML={{ __html: section.content }}
                                                    />

                                                    {(activeLoreSection === idx && !isLoreExpanded && needsTruncation) && (
                                                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent pointer-events-none z-10" />
                                                    )}
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                    {needsTruncation && (
                                        <div className="mt-4 flex justify-center relative z-20">
                                            <button
                                                onClick={() => setIsLoreExpanded(!isLoreExpanded)}
                                                className="px-6 py-2 rounded-xl glass border border-zinc-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors"
                                            >
                                                {isLoreExpanded ? "Condense Lore" : "Expand Lore"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="glass dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden">
                                    <motion.div
                                        ref={loreRef}
                                        className={cn(
                                            "relative transition-all duration-500",
                                            !isLoreExpanded && "max-h-[480px] overflow-hidden"
                                        )}
                                    >
                                        <div
                                            className="prose prose-sm prose-zinc dark:prose-invert leading-relaxed text-zinc-600 dark:text-zinc-400
                                                [&_iframe]:rounded-xl [&_iframe]:border [&_iframe]:border-zinc-200 dark:[&_iframe]:border-white/5 [&_iframe]:w-full [&_iframe]:aspect-video"
                                            dangerouslySetInnerHTML={{ __html: product.description }}
                                        />
                                        {!isLoreExpanded && needsTruncation && (
                                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent pointer-events-none z-10" />
                                        )}
                                    </motion.div>

                                    {needsTruncation && (
                                        <div className="mt-4 flex justify-center relative z-20">
                                            <button
                                                onClick={() => setIsLoreExpanded(!isLoreExpanded)}
                                                className="px-6 py-2 rounded-xl glass border border-zinc-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors"
                                            >
                                                {isLoreExpanded ? "Condense Lore" : "Expand Lore"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Ratings & Reviews Breakdown */}
                <div className="mt-12 border-t border-zinc-200 dark:border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Echoes of Experience</h3>
                            </div>
                            <h2 className="text-xl font-bold font-geist">Community Resonance</h2>
                        </div>
                        {eligibility.canReview && (
                            <button
                                onClick={() => setIsReviewFormOpen(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                            >
                                Share Your Experience
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                        <div className="lg:col-span-4 flex flex-col items-center justify-center glass dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-[1.5rem] p-6 h-fit lg:sticky lg:top-32">
                            <span className="text-5xl font-black text-zinc-900 dark:text-white font-mono leading-none">{stats.average.toFixed(1)}</span>
                            <div className="flex items-center gap-1 my-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("w-5 h-5", i < Math.round(stats.average) ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-800")} />
                                ))}
                            </div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Based on {stats.total} Reactions</p>

                            <div className="w-full mt-10 space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.distribution[star.toString()] || 0;
                                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-4 group">
                                            <div className="flex items-center gap-1 w-10">
                                                <span className="text-[10px] font-black font-mono">{star}</span>
                                                <Star className="w-3 h-3 text-zinc-400" />
                                            </div>
                                            <div className="flex-1 h-2 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-blue-500"
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-500 w-12 text-right font-mono">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            <div className={cn(
                                "space-y-6 pr-2 custom-scrollbar",
                                reviews.length > 2 && "max-h-[500px] overflow-y-auto"
                            )}>
                                {reviews.length > 0 ? (
                                    reviews.map((review, i) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 relative overflow-hidden"
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-500 text-sm">
                                                        {(review.featured_name || (review.profiles && review.profiles.full_name) || "A")[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-black uppercase tracking-wider">{review.featured_name || (review.profiles && review.profiles.full_name) || "Alchemist"}</h4>
                                                            {review.is_featured ? (
                                                                <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                                                    <span className="text-[8px] font-black uppercase text-blue-400 tracking-tighter">Featured Alchemist</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-emerald-500">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Verified User</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5 font-mono">
                                                            {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800")} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium italic text-base">
                                                &quot;{review.comment}&quot;
                                            </p>

                                            {review.is_featured && (
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 glass border border-zinc-200 dark:border-white/10 rounded-[2rem]">
                                        <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-6 opacity-20" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">The registry is currently silent.</p>
                                        <p className="text-xs text-zinc-600 mt-2 uppercase tracking-widest font-bold">Be the first to echo your experience.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {
                    product.is_bundle && product.bundle_items && product.bundle_items.length > 0 && (
                        <div className="mt-12 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Included in this Ritual</h3>
                            </div>
                            <div className="space-y-3">
                                {product.bundle_items.map((item, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-xs border-b border-black/5 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                                        <span className="text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">{item.name}</span>
                                        <span className="text-zinc-500 font-mono">x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold pt-2">
                                Total Value: ₹{product.bundle_items.reduce((sum: number, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </p>
                        </div>
                    )
                }

            </div >

            {/* Recommended Products: Recommended Pairings */}
            {
                recommendedProducts.length > 0 && (
                    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/50">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col mb-16">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-px w-12 bg-blue-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Perfect Synergy</span>
                                </div>
                                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Recommended Pairings</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-sm font-medium tracking-wide max-w-lg uppercase">Specially selected products to complement your daily routine.</p>
                            </div>

                            {/* Unified Looping Marquee for all screen sizes */}
                            <div className="-mx-4 px-4 overflow-hidden">
                                <LoopingMarquee direction="rtl" speed={30} gap={32}>
                                    {recommendedProducts.map((p) => (
                                        <div key={p.id} className="w-[280px] sm:w-[320px]">
                                            <ProductCard
                                                {...p}
                                                image={p.media?.[0] || p.image || "/placeholder.jpg"}
                                            />
                                        </div>
                                    ))}
                                </LoopingMarquee>
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Related Story Section */}
            {
                relatedBlogs && relatedBlogs.length > 0 && (
                    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/30 dark:bg-black/20">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-[clamp(1.75rem,6vw,2.5rem)] font-bold mb-10 md:mb-12 text-zinc-900 dark:text-white">The Story Behind</h2>

                            {/* Unified Looping Marquee for all screen sizes */}
                            <div className="-mx-4 px-4 overflow-hidden pt-4">
                                <LoopingMarquee direction="ltr" speed={35} gap={32}>
                                    {relatedBlogs.map((relatedBlog) => (
                                        <div
                                            key={relatedBlog.id}
                                            onClick={() => router.push(`/blog/${relatedBlog.slug}`)}
                                            className="w-[85vw] sm:w-[500px] lg:w-[600px] group cursor-pointer relative aspect-[16/9] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-white/10 flex-shrink-0 bg-black"
                                        >
                                            <Image
                                                src={relatedBlog.coverImage || "/placeholder.jpg"}
                                                alt={relatedBlog.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest font-bold text-white">
                                                        Editorial
                                                    </span>
                                                    <span className="text-xs font-bold text-zinc-400 hidden sm:inline">
                                                        {relatedBlog.readTime || "5 min"} Read
                                                    </span>
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {relatedBlog.title}
                                                </h3>
                                                <p className="text-zinc-400 line-clamp-1 text-sm hidden sm:block">
                                                    {relatedBlog.excerpt}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </LoopingMarquee>
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Review Form Modal */}
            <AnimatePresence>
                {isReviewFormOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsReviewFormOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.1)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent" />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Share Your Ritual</h3>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Your echo will guide others on their journey.</p>
                                </div>
                                <button onClick={() => setIsReviewFormOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const rating = parseInt(formData.get('rating') as string);
                                const comment = formData.get('comment') as string;

                                if (!rating) return alert("Please select a rating.");

                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) return alert("Please login to submit a review.");

                                const { error } = await supabase
                                    .from('reviews')
                                    .insert({
                                        product_id: product.id,
                                        user_id: user.id,
                                        order_id: eligibility.orderId,
                                        rating,
                                        comment,
                                        is_visible: true
                                    });

                                if (error) {
                                    alert("Magic failure: " + error.message);
                                } else {
                                    setIsReviewFormOpen(false);
                                    fetchReviewData();
                                    setEligibility({ canReview: false });
                                }
                            }} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Potency Level (Rating)</label>
                                    <div className="flex gap-3">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <label key={num} className="cursor-pointer group flex-1">
                                                <input type="radio" name="rating" value={num} className="hidden peer" required />
                                                <div className="aspect-square rounded-2xl border border-white/10 flex items-center justify-center text-zinc-500 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 transition-all group-hover:border-blue-500/50">
                                                    <span className="text-sm font-black font-mono">{num}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">The Scribe&apos;s Tale (Comment)</label>
                                    <textarea
                                        name="comment"
                                        placeholder="How did this product transform your ritual?"
                                        className="w-full h-32 bg-white/[0.03] border border-white/5 rounded-3xl p-5 outline-none focus:border-blue-500/50 transition-all text-sm font-medium resize-none text-white"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                                >
                                    Seal the Echo
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Fullscreen Media Viewer Modal */}
            {
                isFullscreen && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
                        <button
                            onClick={() => {
                                setIsFullscreen(false);
                                setZoomScale(1);
                            }}
                            className="absolute top-8 right-8 p-3 rounded-full glass border-white/10 text-white hover:bg-white/20 transition-all z-[110]"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 glass p-4 rounded-2xl border-white/10 z-[110]">
                            <button onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.5))} className="p-2 text-white hover:text-blue-400 transition-colors"><ZoomOut className="w-5 h-5" /></button>
                            <span className="text-white font-mono text-sm w-12 text-center">{Math.round(zoomScale * 100)}%</span>
                            <button onClick={() => setZoomScale(Math.min(3, zoomScale + 0.5))} className="p-2 text-white hover:text-blue-400 transition-colors"><ZoomIn className="w-5 h-5" /></button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-full flex items-center justify-center overflow-hidden"
                        >
                            <motion.div
                                style={{ scale: zoomScale }}
                                className="w-full h-full flex items-center justify-center"
                                drag={zoomScale > 1}
                                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                            >
                                <MediaViewer
                                    src={product.media[selectedImage] || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="max-w-full max-h-full object-contain"
                                    isFullscreen={true}
                                />
                            </motion.div>
                        </motion.div>

                        {product.media.length > 1 && (
                            <div className="absolute bottom-32 left-0 w-full flex justify-center gap-4 px-4 overflow-x-auto scrollbar-hide">
                                {product.media.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedImage(idx);
                                            setZoomScale(1);
                                        }}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx ? "border-blue-500 scale-110" : "border-white/20 opacity-50 hover:opacity-100"}`}
                                    >
                                        {isVideo(img) ? (
                                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><PlayCircle className="w-6 h-6 text-white/50" /></div>
                                        ) : (
                                            <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
        </main >
    );
}
