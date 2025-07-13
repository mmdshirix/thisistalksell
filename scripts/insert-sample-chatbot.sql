-- Insert a sample chatbot with complete data
INSERT INTO chatbots (
  name, 
  welcome_message, 
  navigation_message, 
  primary_color, 
  text_color, 
  background_color, 
  chat_icon, 
  position, 
  margin_x, 
  margin_y, 
  deepseek_api_key, 
  knowledge_base_text, 
  knowledge_base_url, 
  store_url, 
  ai_url, 
  stats_multiplier,
  enable_product_suggestions,
  enable_next_suggestions,
  prompt_template,
  created_at, 
  updated_at
) VALUES (
  'پشتیبان نمونه',
  'سلام! من پشتیبان نمونه هستم. چطور می‌توانم به شما کمک کنم؟',
  'چه چیزی شما را به اینجا آورده است؟',
  '#14b8a6',
  '#ffffff',
  '#f3f4f6',
  '🤖',
  'bottom-right',
  20,
  20,
  NULL,
  'این یک چت‌بات نمونه است که برای تست عملکرد سیستم ایجاد شده است.',
  NULL,
  'https://example.com',
  NULL,
  1.0,
  true,
  true,
  'شما یک دستیار مفید و دوستانه هستید که همیشه سعی می‌کنید بهترین پاسخ را ارائه دهید.',
  NOW(),
  NOW()
) RETURNING id;

-- Get the chatbot ID for inserting related data
DO $$
DECLARE
    chatbot_id_var INTEGER;
BEGIN
    -- Get the ID of the chatbot we just inserted
    SELECT id INTO chatbot_id_var FROM chatbots WHERE name = 'پشتیبان نمونه' ORDER BY created_at DESC LIMIT 1;
    
    -- Insert sample FAQs
    INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position) VALUES
    (chatbot_id_var, 'ساعات کاری شما چیست؟', 'ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.', '🕘', 0),
    (chatbot_id_var, 'چگونه می‌توانم سفارش دهم؟', 'شما می‌توانید از طریق وب‌سایت ما یا تماس با شماره پشتیبانی سفارش دهید.', '🛒', 1),
    (chatbot_id_var, 'آیا ارسال رایگان دارید؟', 'بله، برای سفارش‌های بالای ۵۰۰ هزار تومان ارسال رایگان است.', '🚚', 2),
    (chatbot_id_var, 'چگونه می‌توانم سفارشم را پیگیری کنم؟', 'با کد پیگیری که پس از ثبت سفارش دریافت کرده‌اید، می‌توانید وضعیت سفارش را بررسی کنید.', '📦', 3);
    
    -- Insert sample products
    INSERT INTO chatbot_products (chatbot_id, name, description, price, image_url, button_text, secondary_text, product_url, position) VALUES
    (chatbot_id_var, 'محصول نمونه ۱', 'این یک محصول نمونه برای تست سیستم است.', 150000, '/placeholder.svg?height=200&width=200', 'مشاهده محصول', 'جزئیات بیشتر', 'https://example.com/product/1', 0),
    (chatbot_id_var, 'محصول نمونه ۲', 'محصول دوم برای نمایش قابلیت‌های چت‌بات.', 250000, '/placeholder.svg?height=200&width=200', 'خرید آنلاین', 'مشخصات فنی', 'https://example.com/product/2', 1),
    (chatbot_id_var, 'محصول نمونه ۳', 'سومین محصول نمونه با قیمت مناسب.', 99000, '/placeholder.svg?height=200&width=200', 'سفارش دهید', 'نظرات کاربران', 'https://example.com/product/3', 2);
    
    -- Insert sample options
    INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES
    (chatbot_id_var, 'پشتیبانی فنی', '🔧', 0),
    (chatbot_id_var, 'اطلاعات محصولات', '📋', 1),
    (chatbot_id_var, 'ثبت شکایت', '📝', 2),
    (chatbot_id_var, 'راهنمای خرید', '🛍️', 3);
    
END $$;
