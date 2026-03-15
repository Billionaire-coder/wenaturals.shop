import { createServerClient } from '@supabase/ssr'
import { cache } from 'react'

export const createStaticClient = cache(async () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return []
                },
                setAll() {
                    // Static client doesn't set cookies
                },
            },
        }
    )
})
