import { FeaturedCollection } from "./FeaturedCollection";
import { getAllProducts } from "@/lib/content-server";
import { createClient } from "@/lib/supabase-server";
import { type Product } from "../shop/ProductGrid";

export async function AsyncFeaturedCollection({ initialContent }: { initialContent: Record<string, unknown> }) {
    // Parallel fetch for this specific section
    const [products, allCategories] = await Promise.all([
        getAllProducts(),
        (async () => {
            try {
                const supabase = await createClient();
                const { data } = await supabase.from('categories').select('name').order('name');
                return data?.map((c: { name: string }) => String(c.name)) || [];
            } catch {
                return [];
            }
        })()
    ]);

    return (
        <FeaturedCollection
            initialContent={initialContent}
            initialProducts={(products || []) as Product[]}
            allCategories={allCategories || []}
        />
    );
}
