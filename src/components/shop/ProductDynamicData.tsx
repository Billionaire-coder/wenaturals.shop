"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface ProductDynamicDataProps {
    productId: string;
    initialPrice: string | number;
    initialStock?: number;
}

export function ProductDynamicData({ productId, initialPrice, initialStock }: ProductDynamicDataProps) {
    const [data, setData] = useState({ price: initialPrice, stock: initialStock });

    useEffect(() => {
        const fetchLatest = async () => {
            const supabase = createClient();
            const { data: latest } = await supabase
                .from('products')
                .select('price, stock')
                .eq('id', productId)
                .single();

            if (latest) {
                setData({ price: latest.price, stock: latest.stock });
            }
        };

        fetchLatest();
    }, [productId]);

    return (
        <div className="flex flex-col">
            <span className="text-md font-medium opacity-80">
                ₹{data.price}
            </span>
            {/* Stock labels hidden per user request for cleaner aesthetic */}
        </div>
    );
}
