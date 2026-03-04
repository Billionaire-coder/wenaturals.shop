import { ShopHero } from "@/components/shop/ShopHero";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    currency: string;
    category: string;
    categories?: string[];
    media: string[];
    image?: string;
    variants: { weight: string | number; unit: string; price: string | number }[];
    marketplace?: Record<string, string>;
    description: string;
    alchemy_config?: {
        material?: "none" | "liquid-gold" | "obsidian" | "iridescent-silk" | "blue-essence";
        glow?: boolean;
        intensity?: number;
    };
    stock: number;
}

export const revalidate = 0; // Disable cache to prevent stale products

export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createClient();
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
    const supabase = await createClient();
    const { data: rawProducts } = await supabase
        .from('products')
        .select(`
            *
        `)
        .order('created_at', { ascending: false })
        .range(0, 11);

    // Fetch Unique Categories (derived from all products for now, or could be separate table)
    // Since we want ALL visible categories, we can fetch distinct categories from DB or use the categories table if populated.
    // Let's use the categories table if available, but for now, let's fetch all products to get unique categories if the table isn't fully relied upon yet.
    // BETTER: specific query for categories table.
    const { data: allCategories } = await supabase
        .from('categories')
        .select('name')
        .order('name');

    const categoryList = allCategories?.map((c: Record<string, unknown>) => String(c.name)) || [];

    interface ProductRow {
        categories?: string[];
        category?: string;
        [key: string]: unknown;
    }

    // Map categories structure (same logic as before, now on server)
    const products = rawProducts?.map((p: ProductRow) => ({
        ...p,
        category: p.categories?.[0] || p.category || "Uncategorized"
    })) || [];

    // Fetch Page Content
    const { data: pageConfig } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'content_pages')
        .single();

    const shopContent = pageConfig?.value?.shop || {
        title: "The Molecular Shop",
        description: "Explore our collection of bio-active serums and botanical distillations.",
        heading: "Curated Skincare"
    };

    return (
        <main className="min-h-screen bg-background pb-20 transition-colors duration-300">
            <ShopHero
                title={shopContent.title}
                description={shopContent.description}
                heading={shopContent.heading}
                media={shopContent.media || []}
            />
            <ProductGrid initialProducts={products as unknown as Product[]} allCategories={categoryList} />
        </main>
    );
}
