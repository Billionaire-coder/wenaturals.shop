
import { createStaticClient } from "@/lib/supabase-static";

export const fetchProductBySlug = async (slug: string) => {
    const supabase = await createStaticClient();

    // Fetch Product
    const { data: productData, error } = await supabase
        .from('products')
        .select(`*`)
        .eq('slug', slug)
        .single();

    if (error || !productData) {
        return null;
    }

    // Map categories accurately from the text array column
    const categories: string[] = Array.isArray(productData.categories)
        ? (productData.categories as unknown[]).map(c => typeof c === 'string' ? c : (c as { name?: string }).name || "Uncategorized")
        : productData.category ? [productData.category as string] : [];

    const displayCategory = categories.length > 0 ? categories[0] : (productData.category as string || "Uncategorized");

    const mappedProduct = {
        ...productData,
        category: displayCategory,
        categories: categories,
        media: productData.media || (productData.image ? [productData.image] : []),
        marketplace: {
            amazon: productData.amazon_link || null,
            flipkart: productData.flipkart_link || null,
            meesho: productData.meesho_link || null
        }
    };

    let relatedBlogs: Record<string, unknown>[] = [];

    // Fetch Related Blogs
    const relatedBlogIds = productData.alchemical_properties?.related_blogs || productData.related_blog_ids || [];

    if (relatedBlogIds.length > 0) {
        const { data: blogsData } = await supabase
            .from('blogs')
            .select('*')
            .in('id', relatedBlogIds);

        if (blogsData) {
            relatedBlogs = blogsData.map((b: Record<string, unknown>) => ({
                ...b,
                coverImage: b.image,
                readTime: "5 min" // static for now
            }));
        }
    }

    // 3. Fetch Reviews
    const { data: realReviews } = await supabase
        .from('reviews')
        .select(`
            *,
            profiles:user_id (full_name)
        `)
        .eq('product_id', productData.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

    const mappedRealReviews = (realReviews || []).map(r => ({
        ...r,
        is_featured: false as const,
        featured_name: null
    }));

    const allReviews = [...mappedRealReviews];

    // Add Featured Fake Reviews
    if (productData.fake_reviews && Array.isArray(productData.fake_reviews)) {
        const fakes = productData.fake_reviews.map((fr: { name: string; comment: string; rating?: number; date?: string }, idx: number) => ({
            id: `featured-${idx}`,
            featured_name: fr.name,
            comment: fr.comment,
            rating: fr.rating || 5,
            is_featured: true as const,
            created_at: fr.date || productData.created_at
        }));
        allReviews.unshift(...fakes);
    }

    // Calculate Stats
    const dist: Record<string, number> = { ... (productData.fake_ratings || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }) };

    // Add featured reviews to dist
    if (productData.fake_reviews && Array.isArray(productData.fake_reviews)) {
        productData.fake_reviews.forEach((fr: { rating?: number }) => {
            const r = fr.rating || 5;
            dist[r.toString()] = (dist[r.toString()] || 0) + 1;
        });
    }

    // Add real reviews to dist
    mappedRealReviews.forEach(r => {
        dist[r.rating.toString()] = (dist[r.rating.toString()] || 0) + 1;
    });

    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    const sum = Object.entries(dist).reduce((acc, [rating, count]) => acc + (Number(rating) * count), 0);
    const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    return {
        product: mappedProduct,
        relatedBlogs,
        reviews: allReviews,
        stats: { average, total, distribution: dist }
    };
};

interface Product {
    id: string;
    recommended_products?: string[];
    category?: string;
    status?: string;
    created_at?: string;
    [key: string]: unknown;
}

export const fetchRecommendedProducts = async (product: Product) => {
    const supabase = await createStaticClient();
    const currentProductId = product.id;
    const manualIds = product.recommended_products || [];
    const category = product.category;

    let finalProducts: Product[] = [];

    // 1. Fetch Manual Selections
    if (manualIds.length > 0) {
        const { data: manualData } = await supabase
            .from('products')
            .select('*')
            .in('id', manualIds.slice(0, 4));

        if (manualData) {
            finalProducts = manualData;
        }
    }

    // 2. If < 4, fill with same category
    if (finalProducts.length < 4) {
        const remainingCount = 4 - finalProducts.length;
        const selectedIds = finalProducts.map(p => p.id);

        const { data: categoryData } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'Published')
            .neq('id', currentProductId)
            .contains('categories', [category])
            .not('id', 'in', `(${[...selectedIds, currentProductId].join(',')})`)
            .limit(remainingCount);

        if (categoryData) {
            finalProducts = [...finalProducts, ...categoryData];
        }
    }

    // 3. If still < 4, fill with latest
    if (finalProducts.length < 4) {
        const remainingCount = 4 - finalProducts.length;
        const selectedIds = finalProducts.map(p => p.id);

        const { data: latestData } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'Published')
            .neq('id', currentProductId)
            .not('id', 'in', `(${[...selectedIds, currentProductId].join(',')})`)
            .order('created_at', { ascending: false })
            .limit(remainingCount);

        if (latestData) {
            finalProducts = [...finalProducts, ...latestData];
        }
    }

    return finalProducts.slice(0, 4).map((p: Product) => {
        const categories: string[] = Array.isArray(p.categories)
            ? (p.categories as unknown[]).map(c => typeof c === 'string' ? c : (c as { name?: string }).name || "Uncategorized")
            : p.category ? [p.category as string] : [];

        const displayCategory = categories.length > 0 ? categories[0] : (p.category as string || "Uncategorized");

        return {
            ...p,
            category: displayCategory,
            categories: categories
        };
    });
};
