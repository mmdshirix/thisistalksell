-- اضافه کردن ستون‌های مورد نیاز در صورت عدم وجود
DO $$ 
BEGIN
    -- بررسی و اضافه کردن ستون stats_multiplier
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'stats_multiplier') THEN
        ALTER TABLE chatbots ADD COLUMN stats_multiplier NUMERIC(5,2) DEFAULT 1.0;
    END IF;
    
    -- بررسی و اضافه کردن ستون‌های دیگر
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'navigation_message') THEN
        ALTER TABLE chatbots ADD COLUMN navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'knowledge_base_text') THEN
        ALTER TABLE chatbots ADD COLUMN knowledge_base_text TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'knowledge_base_url') THEN
        ALTER TABLE chatbots ADD COLUMN knowledge_base_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'store_url') THEN
        ALTER TABLE chatbots ADD COLUMN store_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'ai_url') THEN
        ALTER TABLE chatbots ADD COLUMN ai_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chatbots' AND column_name = 'deepseek_api_key') THEN
        ALTER TABLE chatbots ADD COLUMN deepseek_api_key TEXT;
    END IF;
END $$;

-- حذف چت‌بات نمونه قبلی در صورت وجود
DELETE FROM chatbots WHERE id = 1;

-- ایجاد چت‌بات نمونه
INSERT INTO chatbots (
    id, name, welcome_message, navigation_message, primary_color, text_color, 
    background_color, chat_icon, position, knowledge_base_text, store_url, 
    ai_url, stats_multiplier, created_at, updated_at
) VALUES (
    1,
    'فروشگاه تکنولوژی پیشرفته',
    'سلام! به فروشگاه تکنولوژی پیشرفته خوش آمدید 🚀 چطور می‌توانم به شما کمک کنم؟',
    'چه چیزی شما را به اینجا آورده است؟ محصولات ما را بررسی کنید یا سوال بپرسید!',
    '#3B82F6',
    '#FFFFFF',
    '#F8FAFC',
    '🤖',
    'bottom-right',
    'ما فروشگاه تکنولوژی پیشرفته هستیم که جدیدترین محصولات تکنولوژی را ارائه می‌دهیم. محصولات ما شامل لپ‌تاپ‌ها، گوشی‌های هوشمند، لوازم جانبی و تجهیزات گیمینگ می‌باشد. تمام محصولات دارای گارانتی معتبر و خدمات پس از فروش عالی هستند.',
    'https://techstore.example.com',
    'https://ai.techstore.example.com',
    1.0,
    NOW(),
    NOW()
);

-- اضافه کردن محصولات نمونه
INSERT INTO chatbot_products (chatbot_id, name, description, price, image_url, button_text, secondary_text, product_url, position) VALUES
(1, 'MacBook Pro M3', 'لپ‌تاپ قدرتمند اپل با پردازنده M3 - مناسب برای کارهای حرفه‌ای و طراحی', 89990000, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop', 'خرید فوری', 'مشاهده جزئیات', 'https://techstore.example.com/macbook-pro-m3', 0),
(1, 'iPhone 15 Pro Max', 'جدیدترین گوشی اپل با دوربین پیشرفته و عملکرد بی‌نظیر', 54990000, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop', 'سفارش دهید', 'مقایسه قیمت', 'https://techstore.example.com/iphone-15-pro-max', 1),
(1, 'Sony WH-1000XM5', 'هدفون بی‌سیم با کیفیت صدای استودیویی و حذف نویز فعال', 12990000, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop', 'افزودن به سبد', 'شنیدن نمونه', 'https://techstore.example.com/sony-headphones', 2),
(1, 'Apple Watch Series 9', 'ساعت هوشمند اپل با قابلیت‌های سلامتی پیشرفته', 18990000, 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop', 'خرید آنلاین', 'مقایسه مدل‌ها', 'https://techstore.example.com/apple-watch-9', 3),
(1, 'iPad Air M2', 'تبلت قدرتمند اپل برای کار، تفریح و خلاقیت', 32990000, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop', 'سفارش آنلاین', 'مشاهده ویدیو', 'https://techstore.example.com/ipad-air-m2', 4),
(1, 'Keychron K8 Pro', 'کیبورد مکانیکی بی‌سیم برای گیمرها و برنامه‌نویسان', 4990000, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop', 'خرید کیبورد', 'تست تایپ', 'https://techstore.example.com/keychron-k8', 5);

-- اضافه کردن سوالات متداول
INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position) VALUES
(1, 'قیمت محصولات چقدر است؟', 'قیمت محصولات ما بسیار رقابتی است و همیشه به‌روزرسانی می‌شود. برای مشاهده قیمت دقیق هر محصول، روی آن کلیک کنید.', '💰', 0),
(1, 'گارانتی محصولات چگونه است؟', 'تمام محصولات ما دارای گارانتی معتبر شرکتی هستند. گارانتی از 6 ماه تا 2 سال متغیر است بسته به نوع محصول.', '🛡️', 1),
(1, 'زمان ارسال چقدر است؟', 'ارسال محصولات در تهران 24 ساعته و در سایر شهرها 2-3 روز کاری انجام می‌شود. ارسال رایگان برای خریدهای بالای 5 میلیون تومان.', '🚚', 2),
(1, 'کدام برندها را عرضه می‌کنید؟', 'ما محصولات برندهای معتبر مثل Apple، Samsung، Sony، HP، Dell، Asus، Logitech و بسیاری دیگر را عرضه می‌کنیم.', '🏷️', 3);

-- اضافه کردن گزینه‌های سریع
INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES
(1, 'لپ‌تاپ و کامپیوتر', '💻', 0),
(1, 'گوشی هوشمند', '📱', 1),
(1, 'لوازم جانبی', '🎧', 2),
(1, 'تجهیزات گیمینگ', '🎮', 3),
(1, 'پشتیبانی فنی', '🔧', 4),
(1, 'ثبت شکایت', '📝', 5);

-- اضافه کردن پیام‌های نمونه برای آمار
INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp) VALUES
(1, 'سلام، قیمت MacBook Pro چقدر است؟', 'سلام! قیمت MacBook Pro M3 ما 89,990,000 تومان است. این محصول دارای گارانتی 18 ماهه و ارسال رایگان می‌باشد.', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '2 days'),
(1, 'آیا iPhone 15 موجود است؟', 'بله، iPhone 15 Pro Max در انبار موجود است. قیمت آن 54,990,000 تومان و با گارانتی 18 ماهه ارائه می‌شود.', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', NOW() - INTERVAL '1 day'),
(1, 'زمان ارسال به شیراز چقدر است؟', 'ارسال به شیراز 2-3 روز کاری طول می‌کشد. برای خریدهای بالای 5 میلیون تومان، ارسال رایگان است.', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '5 hours'),
(1, 'کیبورد مکانیکی دارید؟', 'بله! کیبورد مکانیکی Keychron K8 Pro را داریم که بسیار محبوب است. قیمت آن 4,990,000 تومان است.', '192.168.1.103', 'Mozilla/5.0 (X11; Linux x86_64)', NOW() - INTERVAL '2 hours'),
(1, 'گارانتی Apple Watch چقدر است؟', 'Apple Watch Series 9 دارای گارانتی 12 ماهه اپل و 6 ماه گارانتی اضافی فروشگاه ما می‌باشد.', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '1 hour');

-- اضافه کردن تیکت‌های نمونه
INSERT INTO tickets (chatbot_id, name, email, subject, message, status, priority, created_at) VALUES
(1, 'علی احمدی', 'ali.ahmadi@email.com', 'مشکل در پرداخت', 'سلام، هنگام پرداخت با خطا مواجه شدم. لطفاً راهنمایی کنید.', 'open', 'high', NOW() - INTERVAL '3 hours'),
(1, 'فاطمه رضایی', 'fateme.rezaei@email.com', 'سوال درباره گارانتی', 'آیا گارانتی MacBook شامل خدمات نرم‌افزاری هم می‌شود؟', 'pending', 'normal', NOW() - INTERVAL '1 day'),
(1, 'محمد کریمی', 'mohammad.karimi@email.com', 'درخواست مرجوعی', 'محصول خریداری شده مطابق انتظار نبود. امکان مرجوعی هست؟', 'closed', 'normal', NOW() - INTERVAL '2 days');

-- اضافه کردن کاربر مدیر نمونه
INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active, created_at) VALUES
(1, 'admin_tech', '$2a$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', 'مدیر فروشگاه تکنولوژی', 'admin@techstore.example.com', true, NOW());

-- تنظیم مجدد sequence برای ID
SELECT setval('chatbots_id_seq', (SELECT MAX(id) FROM chatbots));
SELECT setval('chatbot_products_id_seq', (SELECT MAX(id) FROM chatbot_products));
SELECT setval('chatbot_faqs_id_seq', (SELECT MAX(id) FROM chatbot_faqs));
SELECT setval('chatbot_options_id_seq', (SELECT MAX(id) FROM chatbot_options));
SELECT setval('chatbot_messages_id_seq', (SELECT MAX(id) FROM chatbot_messages));
SELECT setval('tickets_id_seq', (SELECT MAX(id) FROM tickets));
SELECT setval('chatbot_admin_users_id_seq', (SELECT MAX(id) FROM chatbot_admin_users));

-- نمایش نتیجه
SELECT 'چت‌بات نمونه با موفقیت ایجاد شد!' as result;
SELECT 'شناسه چت‌بات: 1' as chatbot_id;
SELECT 'تعداد محصولات: ' || COUNT(*) as products_count FROM chatbot_products WHERE chatbot_id = 1;
SELECT 'تعداد سوالات متداول: ' || COUNT(*) as faqs_count FROM chatbot_faqs WHERE chatbot_id = 1;
SELECT 'تعداد گزینه‌ها: ' || COUNT(*) as options_count FROM chatbot_options WHERE chatbot_id = 1;
SELECT 'تعداد پیام‌ها: ' || COUNT(*) as messages_count FROM chatbot_messages WHERE chatbot_id = 1;
SELECT 'تعداد تیکت‌ها: ' || COUNT(*) as tickets_count FROM tickets WHERE chatbot_id = 1;
