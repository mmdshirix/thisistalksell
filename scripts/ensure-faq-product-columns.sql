-- Ensure FAQ and Product columns exist with proper structure
-- This script checks and adds missing columns to chatbot_faqs and chatbot_products tables

-- Check and add missing columns to chatbot_faqs table
DO $$ 
BEGIN
    -- Add emoji column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbot_faqs' AND column_name = 'emoji') THEN
        ALTER TABLE chatbot_faqs ADD COLUMN emoji VARCHAR(10) DEFAULT '❓';
        RAISE NOTICE 'Added emoji column to chatbot_faqs table';
    END IF;

    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbot_faqs' AND column_name = 'position') THEN
        ALTER TABLE chatbot_faqs ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added position column to chatbot_faqs table';
    END IF;
END $$;

-- Check and add missing columns to chatbot_products table
DO $$ 
BEGIN
    -- Add button_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbot_products' AND column_name = 'button_text') THEN
        ALTER TABLE chatbot_products ADD COLUMN button_text VARCHAR(100) DEFAULT 'خرید';
        RAISE NOTICE 'Added button_text column to chatbot_products table';
    END IF;

    -- Add secondary_text column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbot_products' AND column_name = 'secondary_text') THEN
        ALTER TABLE chatbot_products ADD COLUMN secondary_text VARCHAR(100) DEFAULT 'جزئیات';
        RAISE NOTICE 'Added secondary_text column to chatbot_products table';
    END IF;

    -- Add product_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbot_products' AND column_name = 'product_url') THEN
        ALTER TABLE chatbot_products ADD COLUMN product_url TEXT;
        RAISE NOTICE 'Added product_url column to chatbot_products table';
    END IF;

    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbot_products' AND column_name = 'position') THEN
        ALTER TABLE chatbot_products ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added position column to chatbot_products table';
    END IF;
END $$;

-- Update existing records to have proper default values
UPDATE chatbot_faqs SET emoji = '❓' WHERE emoji IS NULL;
UPDATE chatbot_faqs SET position = 0 WHERE position IS NULL;
UPDATE chatbot_products SET button_text = 'خرید' WHERE button_text IS NULL;
UPDATE chatbot_products SET secondary_text = 'جزئیات' WHERE secondary_text IS NULL;
UPDATE chatbot_products SET position = 0 WHERE position IS NULL;

RAISE NOTICE 'FAQ and Product columns ensured successfully';
