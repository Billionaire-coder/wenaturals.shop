
import { createStaticClient } from "@/lib/supabase-static";

export interface MappedBlog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    author: string;
    authorId: string;
    date: string;
    readTime: string;
}

export const fetchAllBlogs = async (): Promise<MappedBlog[]> => {
    const supabase = await createStaticClient();
    const { data } = await supabase
        .from('blogs')
        .select(`
            *,
            profiles:author_id (*)
        `)
        .order('created_at', { ascending: false });

    if (!data) return [];

    const getValidUrl = (url: unknown) => {
        if (!url || typeof url !== 'string') return "/placeholder.jpg";
        if (url.startsWith('/')) return url;
        if (url.startsWith('http')) return url;
        return "/placeholder.jpg";
    };

    interface BlogRow {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        image: string;
        created_at: string;
        author_id: string;
        profiles?: { full_name: string };
        [key: string]: unknown;
    }

    return (data as unknown as BlogRow[]).map((b) => {
        const validImage = getValidUrl(b.image);
        return {
            id: b.id,
            title: b.title,
            slug: b.slug,
            excerpt: b.excerpt,
            coverImage: validImage,
            author: b.profiles?.full_name || "Admin",
            authorId: b.author_id,
            readTime: "5 min",
            date: new Date(b.created_at).toLocaleDateString()
        };
    });
};
