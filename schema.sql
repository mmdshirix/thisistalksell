-- Create chatbots table to store widget configurations
CREATE TABLE IF NOT EXISTS chatbots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Visual customization
  primary_color VARCHAR(50) DEFAULT '#0066FF',
  text_color VARCHAR(50) DEFAULT '#333333',
  background_color VARCHAR(50) DEFAULT '#FFFFFF',
  chat_icon TEXT DEFAULT '💬',
  position VARCHAR(50) DEFAULT 'bottom-right',

  -- Functional settings
  deepseek_api_key TEXT,
  welcome_message TEXT DEFAULT 'Hello there! 👋 How can I help you today?',
  navigation_message TEXT DEFAULT 'What brings you here today? Please use the navigation below or ask me anything.',
  
  -- Knowledge base
  knowledge_base_text TEXT,
  knowledge_base_url TEXT
);

-- Create options table for chatbot navigation options
CREATE TABLE IF NOT EXISTS chatbot_options (
  id SERIAL PRIMARY KEY,
  chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  emoji TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

-- Create FAQs table for frequently asked questions
CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id SERIAL PRIMARY KEY,
  chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  emoji TEXT,
  position INTEGER NOT NULL DEFAULT 0
);

-- Create products table for chatbot product recommendations
CREATE TABLE IF NOT EXISTS chatbot_products (
  id SERIAL PRIMARY KEY,
  chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  position INTEGER NOT NULL DEFAULT 0,
  button_text VARCHAR(255) DEFAULT 'Add to cart',
  secondary_text VARCHAR(255) DEFAULT 'Learn more'
);

-- Create messages table for data logging
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id SERIAL PRIMARY KEY,
  chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_ip VARCHAR(50),
  user_agent TEXT
);
