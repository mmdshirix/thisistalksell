-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Chatbots Table: Stores the core configuration for each chatbot
CREATE TABLE IF NOT EXISTS chatbots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
    navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
    
    -- Appearance
    primary_color VARCHAR(7) DEFAULT '#14b8a6',
    text_color VARCHAR(7) DEFAULT '#FFFFFF',
    background_color VARCHAR(255) DEFAULT '#F3F4F6',
    chat_icon TEXT DEFAULT '💬',
    
    -- Positioning
    position VARCHAR(20) DEFAULT 'bottom-right',
    margin_x INTEGER DEFAULT 20,
    margin_y INTEGER DEFAULT 20,

    -- AI & Knowledge Base
    deepseek_api_key TEXT,
    knowledge_base_text TEXT,
    knowledge_base_url VARCHAR(2048),
    store_url VARCHAR(2048),
    ai_url VARCHAR(2048),

    -- Misc
    stats_multiplier NUMERIC(5, 2) DEFAULT 1.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQs Table: Stores frequently asked questions for each chatbot
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    emoji VARCHAR(10),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table: Stores products that the chatbot can suggest
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2),
    image_url VARCHAR(2048),
    product_url VARCHAR(2048),
    button_text VARCHAR(50) DEFAULT 'مشاهده محصول',
    secondary_text VARCHAR(100),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table: Logs all conversations
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    session_id UUID DEFAULT gen_random_uuid(),
    user_message TEXT,
    bot_response TEXT,
    user_ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets Table: For user support requests
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    image_url VARCHAR(2048),
    status VARCHAR(20) DEFAULT 'open', -- e.g., open, in-progress, closed
    priority VARCHAR(20) DEFAULT 'medium', -- e.g., low, medium, high
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to automatically update `updated_at` timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chatbots table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_chatbots') THEN
    CREATE TRIGGER set_timestamp_chatbots
    BEFORE UPDATE ON chatbots
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END;
$$;

-- Trigger for tickets table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_tickets') THEN
    CREATE TRIGGER set_timestamp_tickets
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_faqs_chatbot_id ON faqs(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_products_chatbot_id ON products(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_messages_chatbot_id ON messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_tickets_chatbot_id ON tickets(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
