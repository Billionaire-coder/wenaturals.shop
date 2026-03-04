import { createClient } from '@/lib/supabase';

export interface SearchResult {
    type: 'product' | 'blog';
    id: string;
    title: string;
    slug: string;
    image: string | null;
    price?: number;
}

export const SearchService = {
    async search(query: string): Promise<SearchResult[]> {
        if (!query || query.length < 2) return [];

        const supabase = createClient();

        try {
            const { data, error } = await supabase.rpc('search_site', {
                query_text: query
            }) as { data: SearchResult[] | null, error: unknown };

            if (error) {
                console.error('Search RPC error:', error);
                throw error;
            }

            return data || [];
        } catch (error: unknown) {
            console.error('Search service error:', error);
            return [];
        }
    }
};
