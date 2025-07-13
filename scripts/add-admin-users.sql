-- Create admin users table for chatbot access
CREATE TABLE IF NOT EXISTS chatbot_admin_users (
  id SERIAL PRIMARY KEY,
  chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  UNIQUE(chatbot_id, username)
);

-- Create sessions table for admin authentication
CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON chatbot_admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON chatbot_admin_sessions(expires_at);
