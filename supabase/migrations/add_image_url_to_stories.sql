-- Add image_url column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
