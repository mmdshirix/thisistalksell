-- Ensure tickets table has image_url column
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update any existing tickets without image_url to have NULL
UPDATE tickets SET image_url = NULL WHERE image_url IS NULL;

-- Show table structure to verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;
