-- Migration to add recommended products field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS recommended_products UUID[] DEFAULT '{}';

-- Index for performance in case we query by these IDs often
CREATE INDEX IF NOT EXISTS idx_products_recommended_products ON products USING GIN (recommended_products);
