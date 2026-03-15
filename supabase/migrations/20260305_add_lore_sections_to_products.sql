-- Add lore_sections column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS lore_sections JSONB DEFAULT '[]'::jsonb;

-- Update the column description for clarity
COMMENT ON COLUMN public.products.lore_sections IS 'Structured multi-section content for the product description/lore. Format: [{id, title, content}]';
