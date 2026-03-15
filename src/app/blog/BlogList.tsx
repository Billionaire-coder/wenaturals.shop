"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { MappedBlog } from "@/lib/server/blogs";

interface BlogListProps {
    blogs: MappedBlog[];
}

export default function BlogList({ blogs }: BlogListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
                {blogs.map((blog, i) => (
                    <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group"
                    >
                        <GlassCard className="p-0 border-white/5 overflow-hidden group h-full flex flex-col hover:border-blue-500/30 transition-all duration-500 relative">
                            <Link href={`/blog/${blog.slug}`} className="absolute inset-0 z-10" aria-label={`Read ${blog.title}`} />
                            <div className="relative h-64 w-full overflow-hidden">
                                <Image
                                    src={blog.coverImage}
                                    alt={blog.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col relative z-20 pointer-events-none">
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {blog.date}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-blue-400">
                                        <Clock className="w-3 h-3" />
                                        {blog.readTime}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
                                    {blog.title}
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                                    {blog.excerpt}
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between pointer-events-auto">
                                    <Link href={`/author/${blog.authorId}`} className="group/author relative z-30">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full glass flex items-center justify-center font-bold text-blue-400 border-white/10 text-[10px] group-hover/author:border-blue-500/50 transition-colors">
                                                {blog.author[0]}
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 group-hover/author:text-blue-400 transition-colors">{blog.author}</span>
                                        </div>
                                    </Link>
                                    <div className="w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
