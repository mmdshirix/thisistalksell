-- This script adds the stats_multiplier column to the chatbots table if it doesn't exist.
-- This is crucial for preventing deployment errors when the application code expects this column.

DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chatbots' AND column_name = 'stats_multiplier'
    ) THEN
        -- If it doesn't exist, add it
        ALTER TABLE chatbots ADD COLUMN stats_multiplier NUMERIC(5, 2) DEFAULT 1.0;
        RAISE NOTICE 'Column stats_multiplier added to chatbots table.';
    ELSE
        RAISE NOTICE 'Column stats_multiplier already exists in chatbots table.';
    END IF;
END $$;

-- Update any existing rows where the multiplier might be null
UPDATE chatbots SET stats_multiplier = 1.0 WHERE stats_multiplier IS NULL;

SELECT 'stats_multiplier column check complete.' as result;
