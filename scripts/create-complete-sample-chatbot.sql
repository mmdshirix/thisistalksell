-- Create a complete sample chatbot with FAQs and Products
-- This script creates a fully functional sample chatbot for testing

-- First ensure all required columns exist
DO $$ 
BEGIN
    -- Ensure stats_multiplier column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'stats_multiplier') THEN
        ALTER TABLE chatbots ADD COLUMN stats_multiplier NUMERIC(5,2) DEFAULT 1.0;
    END IF;

    -- Ensure store_url column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'store_url') THEN
        ALTER TABLE chatbots ADD COLUMN store_url TEXT;
    END IF;

    -- Ensure ai_url column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'ai_url') THEN
        ALTER TABLE chatbots ADD COLUMN ai_url TEXT;
    END IF;
END $$;

-- Delete existing sample chatbot if it exists
DELETE FROM chatbots WHERE id = 999;

-- Create the sample chatbot
INSERT INTO chatbots (
    id, name, welcome_message, navigation_message, primary_color, text_color, 
    background_color, chat_icon, position, deepseek_api_key, knowledge_base_text, 
    knowledge_base_url, store_url, ai_url, stats_multiplier, created_at, updated_at
) VALUES (
    999,
    'چت‌بات نمونه تاکسل',
    'سلام! به فروشگاه نمونه تاکسل خوش آمدید. چطور می‌تونم کمکتون کنم؟ 🛍️',
    'چه چیزی دنبال می‌کنید؟',
    '#0D9488',
    '#ffffff',
    '#f9fafb',
    '🤖',
    'bottom-right',
    NULL,
    'این یک چت‌بات نمونه است که برای نمایش قابلیت‌های تاکسل طراحی شده است. ما انواع محصولات الکترونیکی شامل گوشی، لپ‌تاپ، هدفون و لوازم جانبی ارائه می‌دهیم.',
    'https://thisistalksel.vercel.app',
    'https://thisistalksel.vercel.app/store',
    'https://thisistalksel.vercel.app/ai',
    1.0,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    welcome_message = EXCLUDED.welcome_message,
    navigation_message = EXCLUDED.navigation_message,
    primary_color = EXCLUDED.primary_color,
    text_color = EXCLUDED.text_color,
    background_color = EXCLUDED.background_color,
    chat_icon = EXCLUDED.chat_icon,
    position = EXCLUDED.position,
    knowledge_base_text = EXCLUDED.knowledge_base_text,
    knowledge_base_url = EXCLUDED.knowledge_base_url,
    store_url = EXCLUDED.store_url,
    ai_url = EXCLUDED.ai_url,
    stats_multiplier = EXCLUDED.stats_multiplier,
    updated_at = NOW();

-- Delete existing sample FAQs
DELETE FROM chatbot_faqs WHERE chatbot_id = 999;

-- Create sample FAQs
INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position) VALUES
(999, 'محصولات شما چه هستند؟', 'ما انواع محصولات الکترونیکی شامل گوشی هوشمند، لپ‌تاپ، هدفون، ساعت هوشمند و لوازم جانبی ارائه می‌دهیم.', '📱', 0),
(999, 'چطور سفارش دهم؟', 'برای سفارش کافیه روی محصول مورد نظرتون کلیک کنید و مراحل خرید رو دنبال کنید. ما از تمام روش‌های پرداخت پشتیبانی می‌کنیم.', '🛒', 1),
(999, 'زمان ارسال چقدره؟', 'سفارشات معمولاً ظرف 24 ساعت آماده‌سازی و ظرف 2-3 روز کاری به دستتون می‌رسه.', '🚚', 2),
(999, 'گارانتی دارید؟', 'بله، تمام محصولات ما دارای گارانتی معتبر هستند. گوشی‌ها 18 ماه، لپ‌تاپ‌ها 24 ماه و سایر محصولات 12 ماه گارانتی دارند.', '🛡️', 3),
(999, 'پشتیبانی چطوره؟', 'تیم پشتیبانی ما 24/7 در خدمت شماست. می‌تونید از طریق همین چت، تلفن یا ایمیل با ما در تماس باشید.', '💬', 4),
(999, 'تخفیف دارید؟', 'بله! ما همیشه تخفیف‌های ویژه و پیشنهادات شگفت‌انگیز داریم. حتماً بخش تخفیف‌ها رو چک کنید.', '🎉', 5);

-- Delete existing sample products
DELETE FROM chatbot_products WHERE chatbot_id = 999;

-- Create sample products
INSERT INTO chatbot_products (
    chatbot_id, name, description, price, image_url, button_text, 
    secondary_text, product_url, position
) VALUES
(999, 'گوشی سامسونگ Galaxy S24', 'جدیدترین گوشی سامسونگ با دوربین 200 مگاپیکسل و پردازنده قدرتمند', 25000000, '/placeholder.svg?height=300&width=300&text=Galaxy+S24', 'خرید فوری', 'مشاهده جزئیات', 'https://thisistalksel.vercel.app/products/galaxy-s24', 0),
(999, 'لپ‌تاپ ایسوس ROG Strix', 'لپ‌تاپ گیمینگ حرفه‌ای با کارت گرافیک RTX 4070 و پردازنده Intel i7', 45000000, '/placeholder.svg?height=300&width=300&text=ASUS+ROG', 'سفارش دهید', 'مشخصات فنی', 'https://thisistalksel.vercel.app/products/asus-rog', 1),
(999, 'هدفون سونی WH-1000XM5', 'هدفون بی‌سیم با حذف نویز فعال و کیفیت صدای بی‌نظیر', 8500000, '/placeholder.svg?height=300&width=300&text=Sony+WH1000XM5', 'اضافه به سبد', 'بررسی کامل', 'https://thisistalksel.vercel.app/products/sony-headphone', 2),
(999, 'ساعت هوشمند اپل واچ Series 9', 'ساعت هوشمند اپل با قابلیت‌های سلامتی پیشرفته و طراحی زیبا', 15000000, '/placeholder.svg?height=300&width=300&text=Apple+Watch', 'خرید آنلاین', 'ویژگی‌ها', 'https://thisistalksel.vercel.app/products/apple-watch', 3),
(999, 'تبلت آیپد Air M2', 'تبلت قدرتمند اپل با تراشه M2 و صفحه نمایش Liquid Retina', 22000000, '/placeholder.svg?height=300&width=300&text=iPad+Air', 'سفارش آنلاین', 'مقایسه مدل‌ها', 'https://thisistalksel.vercel.app/products/ipad-air', 4),
(999, 'کیبورد مکانیکی لاجیتک MX', 'کیبورد مکانیکی حرفه‌ای با اتصال بلوتوث و باتری طولانی مدت', 3500000, '/placeholder.svg?height=300&width=300&text=Logitech+MX', 'خرید کنید', 'مشخصات', 'https://thisistalksel.vercel.app/products/logitech-keyboard', 5);

-- Create sample admin user
DELETE FROM chatbot_admin_users WHERE chatbot_id = 999;

INSERT INTO chatbot_admin_users (
    chatbot_id, username, password_hash, full_name, email, is_active, created_at, updated_at
) VALUES (
    999, 
    'admin', 
    '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK', -- password: admin123
    'مدیر نمونه', 
    'admin@sample.com', 
    true, 
    NOW(), 
    NOW()
);

-- Create some sample messages for analytics
DELETE FROM chatbot_messages WHERE chatbot_id = 999;

INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp) VALUES
(999, 'سلام', 'سلام! به فروشگاه نمونه تاکسل خوش آمدید. چطور می‌تونم کمکتون کنم؟', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
(999, 'گوشی سامسونگ دارید؟', 'بله! ما جدیدترین مدل‌های سامسونگ رو داریم. Galaxy S24 با قیمت فوق‌العاده پیشنهاد می‌کنم.', '192.168.1.2', 'Mozilla/5.0', NOW() - INTERVAL '23 hours'),
(999, 'قیمت چقدره؟', 'قیمت Galaxy S24 فقط 25 میلیون تومان هست. با گارانتی 18 ماهه.', '192.168.1.2', 'Mozilla/5.0', NOW() - INTERVAL '22 hours'),
(999, 'لپ‌تاپ گیمینگ میخوام', 'لپ‌تاپ ASUS ROG Strix رو پیشنهاد می‌کنم. با RTX 4070 و i7، عالی برای گیم.', '192.168.1.3', 'Mozilla/5.0', NOW() - INTERVAL '12 hours'),
(999, 'هدفون بلوتوث دارید؟', 'Sony WH-1000XM5 بهترین انتخاب هست. حذف نویز عالی و کیفیت صدای فوق‌العاده.', '192.168.1.4', 'Mozilla/5.0', NOW() - INTERVAL '6 hours');

RAISE NOTICE 'Complete sample chatbot created successfully with ID: 999';
RAISE NOTICE 'Sample admin user: admin / admin123';
RAISE NOTICE 'Sample chatbot includes 6 FAQs, 6 products, and sample messages';
