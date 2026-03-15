-- Update orders status check constraint
-- First drop existing constraint if possible, but since we might not know the exact name or if it's there
-- We'll assume the standard name 'status_check' from SUPABASE_SETUP.sql
alter table public.orders drop constraint if exists status_check;
alter table public.orders add constraint status_check check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled'));

-- Extend products table for fake ratings and a featured fake review
alter table public.products add column if not exists fake_ratings jsonb default '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb;
alter table public.products add column if not exists fake_review_name text;
alter table public.products add column if not exists fake_review_comment text;
