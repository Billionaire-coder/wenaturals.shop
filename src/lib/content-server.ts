import { createClient } from "@/lib/supabase-server";
import { cache } from "react";

export const getSiteConfig = cache(async (keys: string[]) => {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('site_config')
            .select('key, value')
            .in('key', keys);

        if (error) {
            console.warn("Supabase Fetch Warning (Site Config):", error.message);
            throw error;
        }

        const configMap: Record<string, unknown> = {};
        data?.forEach(item => {
            configMap[item.key] = item.value;
        });

        return configMap;
    } catch {
        console.warn("Resilience: Using default site configuration due to connection failure.");
        // Provide a robust fallback for the most critical key
        return {
            homepage_layout: ['hero', 'marquee_top', 'philosophy', 'rituals', 'shorts', 'featured', 'journal', 'marquee_bottom', 'categories']
        } as Record<string, unknown>;
    }
});

export const getAllProducts = cache(async () => {
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('products')
            .select(`
                id, 
                name, 
                slug, 
                price, 
                currency, 
                category, 
                categories, 
                image, 
                media, 
                variants, 
                marketplace, 
                description, 
                alchemy_config, 
                stock, 
                created_at
            `)
            .order('created_at', { ascending: false });

        if (!data) return [];


        return (data as Record<string, unknown>[]).map((item) => {
            const categoriesResult: string[] = Array.isArray(item.categories)
                ? item.categories
                : item.category ? [item.category] : [];
            return {
                ...item,
                categories: categoriesResult,
                category: categoriesResult.length > 0 ? categoriesResult[0] : (item.category || "Uncategorized")
            };
        });
    } catch {
        console.warn("Resilience: Using empty product list due to connection failure.");
        return [];
    }
});
