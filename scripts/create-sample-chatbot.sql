-- Create a comprehensive sample chatbot with all features
INSERT INTO chatbots (
  name,
  welcome_message,
  navigation_message,
  primary_color,
  text_color,
  background_color,
  chat_icon,
  position,
  deepseek_api_key,
  knowledge_base_text,
  knowledge_base_url,
  store_url,
  ai_url,
  stats_multiplier,
  created_at,
  updated_at
) VALUES (
  'فروشگاه تکنولوژی پیشرفته',
  'سلام! به فروشگاه تکنولوژی پیشرفته خوش آمدید 🚀\nمن دستیار هوشمند شما هستم و آماده کمک برای یافتن بهترین محصولات تکنولوژی!',
  'چه چیزی دنبال می‌کنید؟ لپ‌تاپ، موبایل، یا شاید هدفون؟',
  '#2563eb',
  '#ffffff',
  '#f8fafc',
  '🤖',
  'bottom-right',
  NULL,
  'ما یک فروشگاه تکنولوژی پیشرفته هستیم که انواع لپ‌تاپ، موبایل، هدفون، ساعت هوشمند و لوازم جانبی عرضه می‌کنیم. تمام محصولات ما اورجینال و دارای گارانتی معتبر هستند. ما همچنین خدمات پس از فروش عالی ارائه می‌دهیم.',
  'https://tech-store.example.com',
  'https://tech-store.example.com/store',
  'https://tech-store.example.com/ai-assistant',
  2.5,
  NOW(),
  NOW()
) 
ON CONFLICT DO NOTHING;

-- Get the chatbot ID (assuming it's the first one if multiple exist)
DO $$
DECLARE
    chatbot_id_var INTEGER;
BEGIN
    SELECT id INTO chatbot_id_var FROM chatbots WHERE name = 'فروشگاه تکنولوژی پیشرفته' LIMIT 1;
    
    -- Add sample FAQs
    INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position) VALUES
    (chatbot_id_var, 'قیمت لپ‌تاپ‌ها چقدر است؟', 'قیمت لپ‌تاپ‌های ما از ۱۵ میلیون تومان شروع می‌شود و تا ۸۰ میلیون تومان متغیر است. بسته به مارک، مشخصات و نیاز شما.', '💻', 1),
    (chatbot_id_var, 'گارانتی محصولات چقدر است؟', 'تمام محصولات ما دارای گارانتی ۱۸ ماهه شرکتی و ۲۴ ماهه گارانتی بین‌المللی هستند.', '🛡️', 2),
    (chatbot_id_var, 'امکان ارسال رایگان دارید؟', 'برای خریدهای بالای ۵ میلیون تومان، ارسال کاملاً رایگان است. زیر این مبلغ ۲۰۰ هزار تومان هزینه ارسال داریم.', '🚚', 3),
    (chatbot_id_var, 'چه برندهایی دارید؟', 'ما محصولات اپل، سامسونگ، هواوی، شیائومی، ایسوس، اچ‌پی، دل و سونی را عرضه می‌کنیم.', '🏪', 4)
    ON CONFLICT DO NOTHING;

    -- Add sample products
    INSERT INTO chatbot_products (
        chatbot_id, name, description, price, image_url, 
        button_text, secondary_text, product_url, position
    ) VALUES
    (chatbot_id_var, 'لپ‌تاپ MacBook Pro M3', 'لپ‌تاپ قدرتمند اپل با چیپ M3، مناسب برای کارهای حرفه‌ای و طراحی', 65000000, '/placeholder.svg?height=300&width=300', 'خرید فوری', 'مشاهده مشخصات', 'https://tech-store.example.com/macbook-pro-m3', 1),
    (chatbot_id_var, 'گوشی iPhone 15 Pro Max', 'جدیدترین آیفون با دوربین 48 مگاپیکسل و چیپ A17 Pro', 52000000, '/placeholder.svg?height=300&width=300', 'سفارش دهید', 'مقایسه قیمت', 'https://tech-store.example.com/iphone-15-pro-max', 2),
    (chatbot_id_var, 'هدفون Sony WH-1000XM5', 'هدفون بی‌سیم با حذف نویز فعال و کیفیت صدای بی‌نظیر', 8500000, '/placeholder.svg?height=300&width=300', 'اضافه به سبد', 'شنیدن نمونه', 'https://tech-store.example.com/sony-wh1000xm5', 3),
    (chatbot_id_var, 'ساعت هوشمند Apple Watch Series 9', 'ساعت هوشمند اپل با قابلیت‌های سلامتی پیشرفته', 15000000, '/placeholder.svg?height=300&width=300', 'خرید آنلاین', 'مشخصات کامل', 'https://tech-store.example.com/apple-watch-series-9', 4),
    (chatbot_id_var, 'تبلت iPad Air M2', 'تبلت قدرتمند اپل برای کار و سرگرمی با نمایشگر Liquid Retina', 28000000, '/placeholder.svg?height=300&width=300', 'سفارش آنلاین', 'مقایسه مدل‌ها', 'https://tech-store.example.com/ipad-air-m2', 5),
    (chatbot_id_var, 'کیبورد مکانیکی Logitech MX', 'کیبورد مکانیکی حرفه‌ای با اتصال بلوتوث و USB', 3200000, '/placeholder.svg?height=300&width=300', 'خرید سریع', 'مشاهده ویدیو', 'https://tech-store.example.com/logitech-mx-keyboard', 6)
    ON CONFLICT DO NOTHING;

    -- Add sample options/quick replies
    INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES
    (chatbot_id_var, 'مشاهده لپ‌تاپ‌ها', '💻', 1),
    (chatbot_id_var, 'گوشی‌های موبایل', '📱', 2),
    (chatbot_id_var, 'هدفون و صوتی', '🎧', 3),
    (chatbot_id_var, 'ساعت هوشمند', '⌚', 4),
    (chatbot_id_var, 'لوازم جانبی', '🔌', 5),
    (chatbot_id_var, 'پشتیبانی فنی', '🛠️', 6)
    ON CONFLICT DO NOTHING;

    -- Add sample messages for analytics
    INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp) VALUES
    (chatbot_id_var, 'سلام، لپ‌تاپ گیمینگ دارید؟', 'سلام! بله، ما انواع لپ‌تاپ‌های گیمینگ داریم. آیا بودجه خاصی در نظر دارید؟', '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '2 days'),
    (chatbot_id_var, 'حدود ۳۰ میلیون تومان', 'عالی! برای این بودجه چندین گزینه عالی داریم. لپ‌تاپ‌های ایسوس ROG و MSI Gaming را پیشنهاد می‌دهم.', '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL '2 days'),
    (chatbot_id_var, 'آیفون ۱۵ در دسترس است؟', 'بله! آیفون ۱۵ در تمام رنگ‌ها و حافظه‌ها موجود است. کدام مدل را ترجیح می‌دهید؟', '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
    (chatbot_id_var, 'Pro Max ۲۵۶ گیگ', 'آیفون ۱۵ Pro Max 256GB با قیمت ۵۲ میلیون تومان موجود است. آیا مایل به مشاهده جزئیات هستید؟', '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL '1 day'),
    (chatbot_id_var, 'هدفون بی‌سیم خوب معرفی کنید', 'برای هدفون بی‌سیم، Sony WH-1000XM5 و Apple AirPods Pro را پیشنهاد می‌دهم. هر دو کیفیت عالی دارند.', '192.168.1.102', 'Mozilla/5.0', NOW() - INTERVAL '3 hours')
    ON CONFLICT DO NOTHING;

    -- Add sample tickets
    INSERT INTO tickets (chatbot_id, name, email, phone, subject, message, status, priority, created_at) VALUES
    (chatbot_id_var, 'علی احمدی', 'ali.ahmadi@email.com', '09123456789', 'مشکل در پرداخت', 'سلام، من سعی کردم لپ‌تاپ MacBook Pro را خریداری کنم اما در مرحله پرداخت مشکل دارم.', 'open', 'high', NOW() - INTERVAL '5 hours'),
    (chatbot_id_var, 'فاطمه محمدی', 'fateme.mohammadi@email.com', '09987654321', 'سوال درباره گارانتی', 'آیا گوشی‌های شما گارانتی اصلی دارند؟ آیا امکان تعویض در صورت مشکل وجود دارد؟', 'pending', 'normal', NOW() - INTERVAL '2 days'),
    (chatbot_id_var, 'حسین رضایی', 'hossein.rezaei@email.com', '09111223344', 'درخواست مشاوره خرید', 'سلام، می‌خواهم یک لپ‌تاپ برای کارهای گرافیکی بخرم. بودجه من ۴۰ میلیون تومان است.', 'closed', 'low', NOW() - INTERVAL '1 week')
    ON CONFLICT DO NOTHING;

    -- Add sample admin user
    INSERT INTO chatbot_admin_users (
        chatbot_id, username, password_hash, full_name, email, is_active, created_at
    ) VALUES (
        chatbot_id_var, 'admin_tech', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Uo/hBIKwR7O4RGi5lWjllbfVV1dOYu', 'مدیر فروشگاه تکنولوژی', 'admin@tech-store.com', true, NOW()
    ) ON CONFLICT DO NOTHING;

END $$;
