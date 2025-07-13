-- Add stats_multiplier column to chatbots table if it doesn't exist
DO $$ 
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chatbots' AND column_name = 'stats_multiplier'
    ) THEN
        ALTER TABLE chatbots ADD COLUMN stats_multiplier DECIMAL(10,2) DEFAULT 1.0;
        RAISE NOTICE 'Added stats_multiplier column to chatbots table';
    ELSE
        RAISE NOTICE 'stats_multiplier column already exists';
    END IF;
END $$;

-- Update existing chatbots to have default multiplier if NULL
UPDATE chatbots SET stats_multiplier = 1.0 WHERE stats_multiplier IS NULL;

-- Verify the column exists and show current data
SELECT id, name, stats_multiplier FROM chatbots ORDER BY id;

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'chatbots' 
ORDER BY ordinal_position;
