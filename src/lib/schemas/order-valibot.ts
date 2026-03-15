import * as v from "valibot";

export const ShippingAddressSchema = v.object({
    street: v.pipe(v.string(), v.minLength(5, "Street address must be at least 5 characters")),
    city: v.pipe(v.string(), v.minLength(1, "City is required")),
    state: v.pipe(v.string(), v.minLength(2, "State is required")),
    pincode: v.pipe(v.string(), v.regex(/^\d{6}$/, "Must be a 6-digit Pincode")),
    country: v.optional(v.string(), "India"),
    district: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string())
});

export const OrderItemSchema = v.object({
    id: v.pipe(v.string(), v.uuid("Invalid Product ID")),
    quantity: v.pipe(v.number(), v.integer(), v.minValue(1, "Quantity must be at least 1")),
    name: v.optional(v.string()),
    price: v.pipe(v.union([v.string(), v.number()]))
});

export const OrderPayloadSchema = v.looseObject({
    user_id: v.pipe(v.string(), v.uuid("Invalid User ID")),
    customer_email: v.pipe(v.string(), v.email("Invalid email address")),
    customer_name: v.pipe(v.string(), v.minLength(1, "Customer Name is required")),
    customer_phone: v.pipe(v.string(), v.minLength(10, "Phone number is too short")),
    shipping_address: ShippingAddressSchema,
    items: v.pipe(v.array(OrderItemSchema), v.minLength(1, "Cart cannot be empty")),
    total_amount: v.pipe(v.number(), v.minValue(0)),
    payment_method: v.optional(v.picklist(['cod', 'upi', 'razorpay']), 'cod'),
    payment_status: v.optional(v.picklist(['pending', 'paid', 'failed', 'refunded']), 'pending'),
    payment_id: v.optional(v.string()),
});

export type ShippingAddress = v.InferOutput<typeof ShippingAddressSchema>;
export type OrderPayload = v.InferOutput<typeof OrderPayloadSchema>;
