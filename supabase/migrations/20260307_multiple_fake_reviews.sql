-- Migration to support multiple fake reviews
alter table public.products add column if not exists fake_reviews jsonb default '[]'::jsonb;

-- (Optional) Migrate existing single fake review to the array if they exist
update public.products
set fake_reviews = jsonb_build_array(
    jsonb_build_object(
        'name', fake_review_name,
        'comment', fake_review_comment
    )
)
where fake_review_name is not null and (fake_reviews is null or fake_reviews = '[]'::jsonb);
