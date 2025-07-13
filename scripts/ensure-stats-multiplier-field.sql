-- اضافه کردن فیلد stats_multiplier به جدول chatbots اگر وجود نداشته باشد
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chatbots' AND column_name = 'stats_multiplier'
    ) THEN
        ALTER TABLE chatbots ADD COLUMN stats_multiplier FLOAT DEFAULT 1.0;
    END IF;
END $$;

-- به‌روزرسانی چت‌بات‌هایی که ضریب آماری ندارند
UPDATE chatbots SET stats_multiplier = 1.0 WHERE stats_multiplier IS NULL;
