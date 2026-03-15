import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, User } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = (await params).id;
    const supabase = await createClient();
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', id).single();

    if (!profile) return { title: "Author Not Found | We Naturals" };

    return {
        title: `${profile.full_name} | We Naturals Alchemist`,
        description: `Read specialized wellness insights and botanical alchemy from ${profile.full_name}.`,
    };
}

export default async function AuthorPage({ params }: Props) {
    const id = (await params).id;
    const supabase = await createClient();

    const [
        { data: profile },
        { data: blogs }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('blogs').select('*').eq('author_id', id).order('created_at', { ascending: false })
    ]);

    if (!profile) notFound();

    return (
        <main className="min-h-screen bg-mesh pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Journal
                </Link>

                <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
                    <div className="w-32 h-32 rounded-full glass border-4 border-blue-500/20 flex items-center justify-center text-4xl font-black text-blue-500 shadow-2xl shadow-blue-500/10">
                        {profile.full_name?.[0] || <User className="w-12 h-12" />}
                    </div>
                    <div className="text-center md:text-left">
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">
                            Verified Alchemist
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">{profile.full_name}</h1>
                        <p className="text-zinc-400 max-w-xl text-lg leading-relaxed">
                            A dedicated contributor to the We Naturals Journal, specializing in the intersection of molecular potency and botanical purity.
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Contributed Chronicles</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {(blogs || []).map((blog) => (
                            <Link key={blog.id} href={`/blog/${blog.slug}`}>
                                <GlassCard className="p-6 border-white/5 hover:border-blue-500/30 transition-all duration-500 group flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors mb-2">{blog.title}</h3>
                                        <p className="text-zinc-500 text-sm line-clamp-1">{blog.excerpt}</p>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-zinc-700 group-hover:text-blue-500 transition-all rotate-180" />
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
