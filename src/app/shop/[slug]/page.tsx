import { fetchProductBySlug, fetchRecommendedProducts } from "@/lib/server/products";
import ProductDetails, { RelatedBlog, RecommendedProduct } from "./ProductDetails";
import { Metadata } from "next";

import { createStaticClient } from "@/lib/supabase-static";

export const runtime = 'nodejs';

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const supabase = await createStaticClient();
    // Pre-render the top 50 products at build time
    const { data: products } = await supabase
        .from('products')
        .select('slug')
        .order('created_at', { ascending: false })
        .limit(50);

    if (!products) return [];

    return products.map((product: { slug: string }) => ({
        slug: product.slug,
    }));
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const slug = (await params).slug;
    const data = await fetchProductBySlug(slug);

    if (!data || !data.product) {
        return {
            title: "Product Not Found | We Naturals",
        };
    }

    const { product } = data;
    const productImage = product.media?.[0] || "/placeholder.jpg";

    return {
        title: `${product.name} | We Naturals`,
        description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "Experience nature's finest.",
        openGraph: {
            title: product.name,
            description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "Experience nature's finest.",
            images: [
                {
                    url: productImage,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description?.replace(/<[^>]*>?/gm, '').slice(0, 160) || "Experience nature's finest.",
            images: [productImage],
        },
        alternates: {
            canonical: `/shop/${slug}`
        }
    };
}

export default async function Page({ params }: Props) {
    const slug = (await params).slug;
    const data = await fetchProductBySlug(slug);

    if (!data || !data.product) {
        return (
            <div className="min-h-screen bg-mesh flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                    <p className="text-zinc-400">This essence may have dissipated.</p>
                </div>
            </div>
        );
    }

    const recommendedProducts = await fetchRecommendedProducts(data.product);

    // JSON-LD for Product
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.product.name,
        "image": data.product.media?.[0]
            ? (data.product.media[0].startsWith('http') ? data.product.media[0] : `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}${data.product.media[0]}`)
            : `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/placeholder.jpg`,
        "description": data.product.description?.replace(/<[^>]*>?/gm, '').slice(0, 300) || "Experience nature's finest.",
        "brand": {
            "@type": "Brand",
            "name": "We Naturals"
        },
        "offers": {
            "@type": "Offer",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/shop/${data.product.slug}`,
            "priceCurrency": data.product.currency || "INR",
            "price": data.product.price,
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "itemCondition": "https://schema.org/NewCondition",
            "availability": data.product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "We Naturals"
            }
        },
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "Molecular Stability",
                "value": "High (Long-term preservation)"
            },
            {
                "@type": "PropertyValue",
                "name": "Botanical Purity",
                "value": "100% Organic Content"
            },
            {
                "@type": "PropertyValue",
                "name": "Alchemical Concentration",
                "value": "Active Biotic Serum"
            }
        ],
        ...(data.stats && data.stats.total > 0 ? {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": data.stats.average,
                "reviewCount": data.stats.total,
                "bestRating": "5",
                "worstRating": "1"
            }
        } : {}),
        ...(data.reviews && data.reviews.length > 0 ? {
            "review": data.reviews.slice(0, 5).map((r: { rating: number; featured_name?: string; profiles?: { full_name: string }; created_at: string; comment: string }) => ({
                "@type": "Review",
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": r.rating,
                    "bestRating": "5",
                    "worstRating": "1"
                },
                "author": {
                    "@type": "Person",
                    "name": r.featured_name || (r.profiles && r.profiles.full_name) || "Verified Alchemist"
                },
                "datePublished": r.created_at,
                "reviewBody": r.comment
            }))
        } : {})
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
                "name": "Shop",
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/shop`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": data.product.name,
                "item": `${process.env.NEXT_PUBLIC_BASE_URL || "https://wenaturals.shop"}/shop/${data.product.slug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <ProductDetails
                product={data.product}
                relatedBlogs={data.relatedBlogs as unknown as RelatedBlog[]}
                recommendedProducts={recommendedProducts as RecommendedProduct[]}
            />
        </>
    );
}
