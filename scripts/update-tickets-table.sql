-- Update tickets table to include name and phone
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_phone VARCHAR(20);

-- Update existing tickets with sample data if needed
UPDATE tickets 
SET user_name = 'کاربر ناشناس', user_phone = '09xxxxxxxxx' 
WHERE user_name IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_chatbot_id ON tickets(chatbot_id);
