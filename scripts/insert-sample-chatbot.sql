-- Insert a sample chatbot for testing purposes
INSERT INTO chatbots (
    name,
    description,
    website_url,
    business_type,
    primary_color,
    welcome_message,
    placeholder_text,
    position,
    enable_product_suggestions,
    enable_faq,
    stats_multiplier,
    created_at,
    updated_at
) VALUES (
    'پشتیبان نمونه',
    'این یک چت‌بات نمونه برای تست عملکرد سیستم است',
    'https://example.com',
    'general',
    '#3B82F6',
    'سلام! من پشتیبان نمونه هستم. چطور می‌تونم کمکتون کنم؟',
    'سوال خود را بپرسید...',
    'bottom-right',
    true,
    true,
    1,
    NOW(),
    NOW()
);

-- Insert some sample FAQs for the chatbot
INSERT INTO faqs (chatbot_id, question, answer, created_at, updated_at)
SELECT 
    c.id,
    'ساعات کاری شما چیست؟',
    'ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.',
    NOW(),
    NOW()
FROM chatbots c WHERE c.name = 'پشتیبان نمونه';

INSERT INTO faqs (chatbot_id, question, answer, created_at, updated_at)
SELECT 
    c.id,
    'چطور می‌تونم سفارش بدم؟',
    'شما می‌تونید از طریق وب‌سایت ما یا تماس با شماره پشتیبانی سفارش خود را ثبت کنید.',
    NOW(),
    NOW()
FROM chatbots c WHERE c.name = 'پشتیبان نمونه';

INSERT INTO faqs (chatbot_id, question, answer, created_at, updated_at)
SELECT 
    c.id,
    'زمان تحویل چقدر است؟',
    'معمولاً سفارشات در عرض ۲-۳ روز کاری تحویل داده می‌شود.',
    NOW(),
    NOW()
FROM chatbots c WHERE c.name = 'پشتیبان نمونه';

-- Insert some sample products for the chatbot
INSERT INTO products (chatbot_id, name, description, price, image_url, created_at, updated_at)
SELECT 
    c.id,
    'محصول نمونه ۱',
    'این یک محصول نمونه برای تست سیستم پیشنهاد محصول است',
    150000,
    '/placeholder.svg?height=200&width=200',
    NOW(),
    NOW()
FROM chatbots c WHERE c.name = 'پشتیبان نمونه';

INSERT INTO products (chatbot_id, name, description, price, image_url, created_at, updated_at)
SELECT 
    c.id,
    'محصول نمونه ۲',
    'محصول دیگری برای تست قابلیت‌های چت‌بات',
    250000,
    '/placeholder.svg?height=200&width=200',
    NOW(),
    NOW()
FROM chatbots c WHERE c.name = 'پشتیبان نمونه';
