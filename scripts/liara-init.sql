-- Create the 'chatbots' table if it doesn't exist
CREATE TABLE IF NOT EXISTS chatbots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    welcome_message TEXT,
    navigation_message TEXT,
    primary_color VARCHAR(7),
    text_color VARCHAR(7),
    background_color VARCHAR(7),
    chat_icon VARCHAR(255),
    position VARCHAR(50),
    store_url TEXT,
    ai_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stats_multiplier DECIMAL(5, 2) DEFAULT 1.0
);

-- Create the 'faqs' table if it doesn't exist
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    emoji VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'products' table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    product_url TEXT,
    button_text VARCHAR(255),
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

-- Create the 'admin_users_on_chatbots' join table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users_on_chatbots (
    admin_user_id INTEGER NOT NULL,
    chatbot_id INTEGER NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_user_id, chatbot_id),
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Add default admin user if not exists
INSERT INTO admin_users (username, password)
VALUES ('admin', 'admin_password_hash_here')
ON CONFLICT (username) DO NOTHING;

-- Add sample chatbot if not exists
INSERT INTO chatbots (name, welcome_message, navigation_message, primary_color, text_color, background_color, chat_icon, position, store_url, ai_url)
VALUES (
    'Sample Chatbot',
    'Hello! How can I help you today?',
    'What would you like to do?',
    '#6366F1',
    '#FFFFFF',
    '#F9FAFB',
    '💬',
    'bottom-right',
    'https://example.com/store',
    'https://example.com/ai'
)
ON CONFLICT (id) DO NOTHING; -- Assuming 'id' is unique or handled by default sequence

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
