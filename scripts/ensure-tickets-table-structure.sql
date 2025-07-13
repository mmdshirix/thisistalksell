-- Ensure tickets table exists with all required columns
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    subject VARCHAR(500),
    message TEXT,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'normal',
    user_ip VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject VARCHAR(500);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_ip VARCHAR(100);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create ticket_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS ticket_responses (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
