-- Update Order and Payment Status Constraints
-- This migration aligns the database check constraints with the application's expected status values.

-- 1. Update Payment Status Constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

COMMENT ON COLUMN public.orders.payment_status IS 'Allowed values: pending, paid, failed, refunded';


-- 2. Update Order Status Constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'pending', 
    'paid', 
    'processing', 
    'shipped', 
    'out_for_delivery', 
    'delivered', 
    'cancelled', 
    'return_requested', 
    'return_processing', 
    'returned'
));

COMMENT ON COLUMN public.orders.status IS 'Allowed values: pending, paid, processing, shipped, out_for_delivery, delivered, cancelled, return_requested, return_processing, returned';
