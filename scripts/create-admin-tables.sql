-- Create the admin users table for each chatbot
CREATE TABLE IF NOT EXISTS chatbot_admin_users (
    id SERIAL PRIMARY KEY,
    chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Each chatbot can have a user with the same username, but not within the same chatbot
    UNIQUE(chatbot_id, username)
);

-- Create the sessions table for admin users
CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it already exists to prevent errors on re-running the script
DROP TRIGGER IF EXISTS update_chatbot_admin_users_updated_at ON chatbot_admin_users;

-- Attach the trigger to the chatbot_admin_users table
CREATE TRIGGER update_chatbot_admin_users_updated_at
BEFORE UPDATE ON chatbot_admin_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
