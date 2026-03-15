import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { RelatedProduct, RelatedBlog } from "./BlogPostClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { createStaticClient } from "@/lib/supabase-static";

export const runtime = 'nodejs';

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const supabase = await createStaticClient();
    // Pre-render the top 50 blog posts at build time
    const { data: blogs } = await supabase
        .from('blogs')
        .select('slug')
        .order('created_at', { ascending: false })
        .limit(50);

    if (!blogs) return [];

    return blogs.map((blog: { slug: string }) => ({
        slug: blog.slug,
    }));
}

async function getBlog(slug: string) {
    // For blog metadata and page content, we use the static client to avoid cookies() during build
    // but we can fallback to server client if needed. Since blog is public, static is safer.
    const supabase = await createStaticClient();
    const decodedSlug = decodeURIComponent(slug);

    const { data: blog, error } = await supabase
        .from('blogs')
        .select(`
            *,
            profiles:author_id (full_name)
        `)
        .eq('slug', decodedSlug)
        .single();

    if (error || !blog) return null;

    // Helper to process URL
    const getValidUrl = (url: unknown) => {
        if (!url || typeof url !== 'string') return "/placeholder.jpg";
        if (url.startsWith('/')) return url;
        if (url.startsWith('http')) return url;
        return "/placeholder.jpg";
    };

    const processedBlog = {
        ...blog,
        coverImage: getValidUrl(blog.image),
        media: blog.alchemical_properties?.media || (blog.image ? [blog.image] : []),
        author: blog.profiles?.full_name || "Admin",
        authorId: blog.author_id,
        readTime: blog.alchemical_properties?.read_time || "5 min",
        date: new Date(blog.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        isoDate: new Date(blog.created_at).toISOString(),
        updatedAt: blog.updated_at ? new Date(blog.updated_at).toISOString() : new Date(blog.created_at).toISOString()
    };

    const relatedProductIds = blog.alchemical_properties?.related_products || blog.related_product_ids || [];
    let relatedProducts: RelatedProduct[] = [];
    if (relatedProductIds.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', relatedProductIds);
        if (products) relatedProducts = products as unknown as RelatedProduct[];
    }

    const relatedBlogIds = blog.alchemical_properties?.related_blogs || [];
    let relatedBlogs: RelatedBlog[] = [];
    if (relatedBlogIds.length > 0) {
        const { data: blogs } = await supabase
            .from('blogs')
            .select('id, title, excerpt, image, slug, created_at, alchemical_properties')
            .in('id', relatedBlogIds);
        if (blogs) {
            relatedBlogs = blogs.map(b => ({
                id: b.id,
                title: b.title,
                slug: b.slug,
                image: getValidUrl(b.image),
                date: new Date(b.created_at).toLocaleDateString(),
                readTime: b.alchemical_properties?.read_time || "5 min"
            }));
        }
    }

    return { blog: processedBlog, relatedProducts, relatedBlogs };
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const slug = (await params).slug;
    const data = await getBlog(slug);

    if (!data) {
        return {
            title: "Story Not Found | We Naturals",
        };
    }

    const { blog } = data;

    return {
        title: `${blog.title} | We Naturals Journal`,
        description: blog.excerpt || `Read more about ${blog.title} on We Naturals.`,
        openGraph: {
            title: blog.title,
            description: blog.excerpt,
            images: [
                {
                    url: blog.coverImage,
                    width: 1200,
                    height: 630,
                    alt: blog.title,
                }
            ],
            type: "article",
            publishedTime: blog.isoDate,
            modifiedTime: blog.updatedAt,
            authors: [blog.author],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.excerpt,
            images: [blog.coverImage],
        },
        alternates: {
            canonical: `/blog/${slug}`
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const slug = (await params).slug;
    const data = await getBlog(slug);

    if (!data) {
        notFound();
    }

    const { blog, relatedProducts, relatedBlogs } = data;

    // JSON-LD for Article
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "image": blog.coverImage.startsWith('http')
            ? blog.coverImage
            : `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}${blog.coverImage}`,
        "datePublished": blog.isoDate,
        "dateModified": blog.updatedAt,
        "author": [{
            "@type": "Person",
            "name": blog.author,
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/author/${blog.authorId}`
        }],
        "publisher": {
            "@type": "Organization",
            "name": "We Naturals",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/we_naturals_logo.png`
            }
        },
        "description": blog.excerpt
    };

    // BreadcrumbList Schema
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Journal",
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/blog`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": blog.title,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/blog/${blog.slug}`
            }
        ]
    };

    return (
        <>
            <JsonLd data={jsonLd} />
            <JsonLd data={breadcrumbJsonLd} />
            <BlogPostClient
                blog={blog}
                relatedProducts={relatedProducts}
                relatedBlogs={relatedBlogs}
            />
        </>
    );
}
