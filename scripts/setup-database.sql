-- Create chatbots table
CREATE TABLE IF NOT EXISTS chatbots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    primary_color VARCHAR(7) DEFAULT '#0066FF',
    text_color VARCHAR(7) DEFAULT '#333333',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    chat_icon VARCHAR(10) DEFAULT '💬',
    position VARCHAR(20) DEFAULT 'bottom-right',
    deepseek_api_key TEXT,
    welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
    navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
    knowledge_base_text TEXT,
    knowledge_base_url TEXT,
    store_url TEXT,
    ai_url TEXT
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    bot_response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45),
    user_agent TEXT
);

-- Create chatbot_faqs table
CREATE TABLE IF NOT EXISTS chatbot_faqs (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    emoji VARCHAR(10),
    position INTEGER DEFAULT 0
);

-- Create chatbot_products table
CREATE TABLE IF NOT EXISTS chatbot_products (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2),
    position INTEGER DEFAULT 0,
    button_text VARCHAR(100) DEFAULT 'خرید',
    secondary_text VARCHAR(100),
    product_url TEXT
);

-- Create chatbot_options table
CREATE TABLE IF NOT EXISTS chatbot_options (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER REFERENCES chatbots(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    emoji VARCHAR(10),
    position INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_chatbot_id ON chatbot_faqs(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_products_chatbot_id ON chatbot_products(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_options_chatbot_id ON chatbot_options(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_chatbot_id ON chatbot_messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_timestamp ON chatbot_messages(timestamp);

-- Insert sample chatbot if none exists
INSERT INTO chatbots (name, primary_color, text_color, background_color, chat_icon, position, welcome_message, navigation_message, knowledge_base_text)
SELECT 
    'چت‌بات فروشگاه تکنولوژی',
    '#2563EB',
    '#1F2937', 
    '#FFFFFF',
    '🤖',
    'bottom-right',
    'سلام! به فروشگاه تکنولوژی خوش آمدید. چطور می‌توانم کمکتان کنم؟',
    'امروز چه کاری برات انجام بدم؟ از منوی زیر استفاده کن یا هر سوالی داری بپرس.',
    'ما فروشگاه تکنولوژی هستیم و انواع محصولات فناوری ارائه می‌دهیم.'
WHERE NOT EXISTS (SELECT 1 FROM chatbots);

-- Insert sample FAQs
INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
SELECT 
    1,
    'ساعات کاری شما چیست؟',
    'ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.',
    '🕒',
    0
WHERE NOT EXISTS (SELECT 1 FROM chatbot_faqs WHERE chatbot_id = 1 AND question = 'ساعات کاری شما چیست؟');

INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
SELECT 
    1,
    'چگونه سفارش دهم؟',
    'می‌توانید از طریق سایت ما سفارش دهید یا با شماره تماس ۰۲۱-۱۲۳۴۵۶۷۸ تماس بگیرید.',
    '🛒',
    1
WHERE NOT EXISTS (SELECT 1 FROM chatbot_faqs WHERE chatbot_id = 1 AND question = 'چگونه سفارش دهم؟');

-- Insert sample products
INSERT INTO chatbot_products (chatbot_id, name, description, image_url, price, position, button_text, secondary_text)
SELECT 
    1,
    'لپ‌تاپ گیمینگ',
    'لپ‌تاپ قدرتمند برای بازی و کار',
    '/placeholder.svg?height=200&width=200',
    25000000,
    0,
    'مشاهده محصول',
    'موجود در انبار'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_products WHERE chatbot_id = 1 AND name = 'لپ‌تاپ گیمینگ');

INSERT INTO chatbot_products (chatbot_id, name, description, image_url, price, position, button_text, secondary_text)
SELECT 
    1,
    'گوشی هوشمند',
    'آخرین مدل گوشی با امکانات پیشرفته',
    '/placeholder.svg?height=200&width=200',
    15000000,
    1,
    'خرید',
    'تخفیف ویژه'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_products WHERE chatbot_id = 1 AND name = 'گوشی هوشمند');

INSERT INTO chatbot_products (chatbot_id, name, description, image_url, price, position, button_text, secondary_text)
SELECT 
    1,
    'هدفون بی‌سیم',
    'هدفون با کیفیت صدای عالی',
    '/placeholder.svg?height=200&width=200',
    2500000,
    2,
    'اطلاعات بیشتر',
    'پرفروش‌ترین'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_products WHERE chatbot_id = 1 AND name = 'هدفون بی‌سیم');
