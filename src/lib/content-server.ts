import { createClient } from "@/lib/supabase-server";

export async function getSiteConfig(keys: string[]) {
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
}

export async function getAllProducts() {
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('products')
            .select(`*`)
            .order('created_at', { ascending: false });

        if (!data) return [];


        return (data as unknown[]).map((item: unknown) => {
            const p = item as Record<string, unknown>;
            return {
                ...p,
                category: (p.categories as string[] | undefined)?.[0] || (p.category as string) || "Uncategorized"
            };
        });
    } catch {
        console.warn("Resilience: Using empty product list due to connection failure.");
        return [];
    }
}
