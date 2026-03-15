import { fetchAllBlogs } from "@/lib/server/blogs";
import BlogList from "./BlogList";
import { Metadata } from "next";


export const runtime = 'nodejs';

export const metadata: Metadata = {
    title: "Whispers of Nature | We Naturals Journal",
    description: "Insights into the alchemy of wellness, molecular science, and the art of intentional living.",
    openGraph: {
        title: "Whispers of Nature | We Naturals Journal",
        description: "Insights into the alchemy of wellness, molecular science, and the art of intentional living.",
        type: "website",
    },
    alternates: {
        canonical: '/blog'
    }
};

export default async function BlogIndex() {
    const blogs = await fetchAllBlogs();

    return (
        <main className="min-h-screen bg-mesh pt-0 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 text-center pt-24 md:pt-32">
                    <div className="inline-block px-4 py-1.5 glass rounded-full border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6">
                        The Chronicles
                    </div>
                    <h1 className="text-[clamp(2.5rem,10vw,4.5rem)] font-bold mb-6 tracking-tighter leading-[1.1]">
                        Whispers of <span className="text-gradient">Nature</span>
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
                        Insights into the alchemy of wellness, molecular science, and the art of intentional living.
                    </p>
                </div>

                <BlogList blogs={blogs} />
            </div>
        </main>
    );
}
