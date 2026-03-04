export interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
    product?: {
        image?: string;
        media?: string[];
        name?: string;
    };
    name?: string;
    price?: number;
}

export interface Order {
    id: string;
    created_at: string | number | Date;
    status: string;
    total_amount: number | string;
    payment_status?: string;
    payment_method?: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    tracking_number?: string;
    carrier?: string;
    shipping_address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
        phone?: string;
    };
    items: OrderItem[];
}
