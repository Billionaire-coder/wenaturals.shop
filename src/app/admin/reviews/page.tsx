"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Eye, EyeOff, Star, ShieldCheck, User } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

interface Review {
    id: string;
    product_id: string;
    rating: number;
    comment: string;
    is_visible: boolean;
    is_fake: boolean;
    fake_customer_name?: string;
    created_at: string;
    user_id?: string;
    products?: {
        name: string;
        media: string[];
    };
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export default function ReviewManagementPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                products (name, media),
                profiles:user_id (full_name, avatar_url)
            `)
            .order('created_at', { ascending: false });

        if (data) setReviews(data as unknown as Review[]);
        if (error) console.error("Error fetching reviews:", error);
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleVisibility = async (id: string, currentVisibility: boolean) => {
        const { error } = await supabase
            .from('reviews')
            .update({ is_visible: !currentVisibility })
            .eq('id', id);

        if (!error) {
            setReviews(prev => prev.map(r => r.id === id ? { ...r, is_visible: !currentVisibility } : r));
        }
    };

    const deleteReview = async (id: string) => {
        if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (!error) {
                setReviews(prev => prev.filter(r => r.id !== id));
            }
        }
    };

    const filteredReviews = reviews.filter(r =>
        (r.products?.name.toLowerCase().includes(search.toLowerCase())) ||
        (r.comment?.toLowerCase().includes(search.toLowerCase())) ||
        (r.fake_customer_name?.toLowerCase().includes(search.toLowerCase())) ||
        (r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Review Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Moderate customer reviews and manage trust-builder content.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reviews..."
                        className="bg-[#050505] border border-white/5 rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all text-xs w-full"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                </div>
            ) : (
                <GlassCard className="p-0 overflow-hidden border-white/5">
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 bg-white/[0.02] border-b border-white/5">
                        <div className="col-span-3">Product</div>
                        <div className="col-span-2">Customer</div>
                        <div className="col-span-1 text-center">Rating</div>
                        <div className="col-span-4">Review</div>
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {filteredReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col lg:grid lg:grid-cols-12 gap-4 px-6 md:px-8 py-5 items-start lg:items-center hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="lg:col-span-3 flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-white/5">
                                            {review.products?.media?.[0] ? (
                                                <Image src={review.products.media[0]} alt={review.products.name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-[8px] text-zinc-600 font-bold uppercase">No Image</div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold truncate">{review.products?.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono truncate">{review.product_id}</p>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 flex items-center gap-2">
                                        {review.is_fake ? (
                                            <>
                                                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
                                                    <ShieldCheck className="w-3 h-3" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{review.fake_customer_name}</p>
                                                    <p className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">Fake/Manual</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-1.5 bg-white/5 text-zinc-400 rounded-md">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold">{review.profiles?.full_name || "Real Customer"}</p>
                                                    <p className="text-[9px] text-emerald-400 font-black uppercase tracking-tighter">Verified Order</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="lg:col-span-1 flex justify-center">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-black">{review.rating}</span>
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 italic text-zinc-400 text-xs">
                                        &quot;{review.comment || "No comment provided."}&quot;
                                    </div>

                                    <div className="lg:col-span-1 flex justify-center">
                                        <button
                                            onClick={() => toggleVisibility(review.id, review.is_visible)}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                                                review.is_visible
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                    : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
                                            )}
                                        >
                                            {review.is_visible ? "Visible" : "Hidden"}
                                        </button>
                                    </div>

                                    <div className="lg:col-span-1 flex justify-end gap-1 w-full lg:w-auto mt-4 lg:mt-0">
                                        <button
                                            onClick={() => toggleVisibility(review.id, review.is_visible)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                                            title={review.is_visible ? "Hide Review" : "Show Review"}
                                        >
                                            {review.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => deleteReview(review.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                                            title="Delete Review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
