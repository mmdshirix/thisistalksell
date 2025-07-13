-- ایجاد جدول محصولات پیشنهادی
CREATE TABLE IF NOT EXISTS suggested_products (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES chatbot_products(id) ON DELETE CASCADE,
    user_ip VARCHAR(255),
    user_agent TEXT,
    suggested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    UNIQUE(chatbot_id, product_id, user_ip)
);

-- ایجاد ایندکس برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_suggested_products_chatbot_user 
ON suggested_products(chatbot_id, user_ip, expires_at);

CREATE INDEX IF NOT EXISTS idx_suggested_products_expires 
ON suggested_products(expires_at);
