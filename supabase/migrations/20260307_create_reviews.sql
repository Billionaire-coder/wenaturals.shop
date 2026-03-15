-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_visible boolean default true,
  is_fake boolean default false,
  fake_customer_name text,
  created_at timestamptz default now()
);

-- Unique constraint: 1 review per user, per product, per order
create unique index idx_reviews_user_product_order on public.reviews (user_id, product_id, order_id) where user_id is not null and order_id is not null;

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Visible reviews are viewable by everyone."
  on reviews for select
  using ( is_visible = true );

create policy "Admins can manage all reviews."
  on reviews for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to check if user can review
create or replace function can_user_review(p_user_id uuid, p_product_id uuid, p_order_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 
    from public.orders o
    join public.order_items oi on o.id = oi.order_id
    where o.user_id = p_user_id
    and o.id = p_order_id
    and oi.product_id = p_product_id
    and o.status = 'delivered'
  );
end;
$$ language plpgsql security definer;

create policy "Users can insert their own reviews for delivered items."
  on reviews for insert
  with check (
    auth.uid() = user_id 
    and is_fake = false
    and can_user_review(auth.uid(), product_id, order_id)
  );
