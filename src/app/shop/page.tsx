import { ShopHero } from "@/components/shop/ShopHero";
import { ProductGrid, type Product } from "@/components/shop/ProductGrid";

import { createStaticClient } from "@/lib/supabase-static";
import type { Metadata } from "next";



export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createStaticClient();
    const { data: pageConfig } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'content_pages')
        .single();

    const shopContent = pageConfig?.value?.shop || {
        title: "The Molecular Shop",
        description: "Explore our collection of bio-active serums and botanical distillations."
    };

    return {
        title: `${shopContent.title} | We Naturals`,
        description: shopContent.description,
        alternates: {
            canonical: '/shop'
        }
    };
}

export default async function ShopPage() {
    const supabase = await createStaticClient();
    const { data: rawProducts } = await supabase
        .from('products')
        .select(`*`)
        .order('created_at', { ascending: false })
        .range(0, 50);

    // Fetch Unique Categories (derived from all products for now, or could be separate table)
    // Since we want ALL visible categories, we can fetch distinct categories from DB or use the categories table if populated.
    // Let's use the categories table if available, but for now, let's fetch all products to get unique categories if the table isn't fully relied upon yet.
    // BETTER: specific query for categories table.
    const { data: allCategories } = await supabase
        .from('categories')
        .select('name')
        .order('name');

    const categoryList = allCategories?.map((c: Record<string, unknown>) => String(c.name)) || [];

    // Map categories structure
    const products = rawProducts?.map((p: Product) => {
        const categoriesResult: string[] = Array.isArray(p.categories)
            ? p.categories
            : p.category ? [p.category] : [];
        return {
            ...p,
            categories: categoriesResult,
            category: categoriesResult[0] || "Uncategorized"
        };
    }) || [];

    // Fetch Page Content
    const { data: pageConfig } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'content_pages')
        .single();

    const defaultShopContent = {
        title: "The Collections",
        description: "A sanctuary of bio-active elixirs where clinical precision meets the raw intelligence of nature. Discover the formulas designed to resonate with your skin's unique frequency.",
        heading: "Curated Skincare"
    };

    const rawShopContent = pageConfig?.value?.shop || {};
    const shopContent = {
        ...defaultShopContent,
        ...rawShopContent,
        // Force fallback if field is empty string or missing
        title: rawShopContent.title || defaultShopContent.title,
        description: rawShopContent.description || defaultShopContent.description,
        heading: rawShopContent.heading || defaultShopContent.heading
    };

    return (
        <main className="min-h-screen bg-background transition-colors duration-300">
            <ShopHero
                title={shopContent.title}
                description={shopContent.description}
                heading={shopContent.heading}
                media={shopContent.media || []}
            />
            <ProductGrid initialProducts={products as Product[]} allCategories={categoryList} />
        </main>
    );
}
