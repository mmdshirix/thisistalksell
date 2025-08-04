-- Create the 'chatbots' table if it doesn't exist
CREATE TABLE IF NOT EXISTS chatbots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stats_multiplier DECIMAL(5, 2) DEFAULT 1.0,
    widget_position VARCHAR(50) DEFAULT 'bottom-right',
    widget_icon TEXT,
    chat_header VARCHAR(255) DEFAULT 'AI Chatbot',
    chat_welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
    primary_color VARCHAR(7) DEFAULT '#6366F1',
    secondary_color VARCHAR(7) DEFAULT '#F3F4F6',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#1F2937',
    font_family VARCHAR(255) DEFAULT 'sans-serif',
    border_radius VARCHAR(50) DEFAULT '0.75rem'
);

-- Create the 'faqs' table if it doesn't exist
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    suggested_product_id INTEGER
);

-- Create the 'products' table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to faqs table for suggested_product_id
DO $$ BEGIN
    ALTER TABLE faqs ADD CONSTRAINT fk_suggested_product
    FOREIGN KEY (suggested_product_id) REFERENCES products(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create the 'admin_users' table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'tickets' table if it doesn't exist
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_phone VARCHAR(255),
    issue TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'ticket_responses' table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_responses (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add default admin user if not exists
INSERT INTO admin_users (chatbot_id, username, password, role)
SELECT 1, 'admin', 'admin_password_hash', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin');

-- Add sample chatbot if not exists
INSERT INTO chatbots (name, description, chat_welcome_message)
SELECT 'Sample Chatbot', 'A sample chatbot for demonstration purposes.', 'Welcome to our sample chatbot! How can I help you today?'
WHERE NOT EXISTS (SELECT 1 FROM chatbots WHERE name = 'Sample Chatbot');

-- Add sample FAQ if not exists
INSERT INTO faqs (chatbot_id, question, answer)
SELECT 1, 'What is your return policy?', 'Our return policy allows returns within 30 days of purchase with a valid receipt.'
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What is your return policy?');

-- Add sample product if not exists
INSERT INTO products (chatbot_id, name, description, price)
SELECT 1, 'Sample Product A', 'This is a description for Sample Product A.', 29.99
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sample Product A');

-- Add sample ticket if not exists
INSERT INTO tickets (chatbot_id, user_id, issue, status)
SELECT 1, 'user123', 'I have an issue with my recent order.', 'open'
WHERE NOT EXISTS (SELECT 1 FROM tickets WHERE user_id = 'user123');
