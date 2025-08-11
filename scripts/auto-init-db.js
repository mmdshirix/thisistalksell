const { Pool } = require("pg")

// Database connection configuration
const CANDIDATES = [
  "POSTGRES_URL",
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "DATABASE_URL_UNPOOLED",
]

function pickConnectionString() {
  for (const key of CANDIDATES) {
    const val = process.env[key]
    if (val && typeof val === "string" && val.trim()) {
      return { url: val.trim(), usedEnv: key }
    }
  }

  const host = process.env.PGHOST_UNPOOLED || process.env.PGHOST || process.env.POSTGRES_HOST
  const user = process.env.PGUSER || process.env.POSTGRES_USER
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE
  const port = process.env.PGPORT || "5432"

  if (host && user && database) {
    const enc = (s) => encodeURIComponent(s)
    const pass = password ? `:${enc(password)}` : ""
    const url = `postgresql://${enc(user)}${pass}@${host}:${port}/${enc(database)}`
    return { url, usedEnv: "PGHOST/PGUSER/PGPASSWORD/PGDATABASE" }
  }

  return {}
}

async function initializeDatabase() {
  const { url } = pickConnectionString()

  if (!url) {
    console.log("⚠️  No database connection string found. Skipping auto-initialization.")
    return
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  })

  try {
    console.log("🔄 Auto-initializing database...")

    // Test connection
    await pool.query("SELECT 1")
    console.log("✅ Database connection successful")

    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'chatbots'
    `)

    if (tablesResult.rows.length === 0) {
      console.log("📋 Creating database tables...")

      // Create all tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbots (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          primary_color VARCHAR(50) DEFAULT '#14b8a6',
          text_color VARCHAR(50) DEFAULT '#ffffff',
          background_color VARCHAR(50) DEFAULT '#f8fafc',
          chat_icon TEXT DEFAULT '💬',
          position VARCHAR(50) DEFAULT 'bottom-right',
          margin_x INTEGER DEFAULT 20,
          margin_y INTEGER DEFAULT 20,
          deepseek_api_key TEXT,
          welcome_message TEXT DEFAULT 'سلام! چطور می‌توانم به شما کمک کنم؟',
          navigation_message TEXT DEFAULT 'چه چیزی شما را به اینجا آورده است؟',
          knowledge_base_text TEXT,
          knowledge_base_url TEXT,
          store_url TEXT,
          ai_url TEXT,
          stats_multiplier NUMERIC(5,2) DEFAULT 1.0
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbot_messages (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
          user_message TEXT NOT NULL,
          bot_response TEXT,
          timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          user_ip VARCHAR(50),
          user_agent TEXT
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbot_faqs (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          answer TEXT,
          emoji VARCHAR(10) DEFAULT '❓',
          position INTEGER DEFAULT 0
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbot_products (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT,
          price DECIMAL(10,2),
          position INTEGER DEFAULT 0,
          button_text VARCHAR(100) DEFAULT 'خرید',
          secondary_text VARCHAR(100) DEFAULT 'جزئیات',
          product_url TEXT
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbot_options (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
          label VARCHAR(255) NOT NULL,
          emoji TEXT,
          position INTEGER DEFAULT 0
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          user_ip VARCHAR(50),
          user_agent TEXT,
          subject VARCHAR(500) NOT NULL,
          message TEXT NOT NULL,
          image_url TEXT,
          status VARCHAR(50) DEFAULT 'open',
          priority VARCHAR(50) DEFAULT 'normal',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS ticket_responses (
          id SERIAL PRIMARY KEY,
          ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbot_admin_users (
          id SERIAL PRIMARY KEY,
          chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
          username VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255),
          email VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `)

      console.log("✅ Database tables created successfully")

      // Create indexes
      await pool.query("CREATE INDEX IF NOT EXISTS idx_chatbot_messages_chatbot_id ON chatbot_messages(chatbot_id)")
      await pool.query("CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_chatbot_id ON chatbot_faqs(chatbot_id)")
      await pool.query("CREATE INDEX IF NOT EXISTS idx_chatbot_products_chatbot_id ON chatbot_products(chatbot_id)")
      await pool.query("CREATE INDEX IF NOT EXISTS idx_chatbot_options_chatbot_id ON chatbot_options(chatbot_id)")
      await pool.query("CREATE INDEX IF NOT EXISTS idx_tickets_chatbot_id ON tickets(chatbot_id)")
      await pool.query("CREATE INDEX IF NOT EXISTS idx_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id)")

      console.log("✅ Database indexes created successfully")
    }

    // Check if sample data exists
    const chatbotCount = await pool.query("SELECT COUNT(*) as count FROM chatbots")
    if (Number.parseInt(chatbotCount.rows[0].count) === 0) {
      console.log("📝 Creating sample chatbot data...")

      // Create sample chatbot with bcryptjs
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      const chatbotResult = await pool.query(`
        INSERT INTO chatbots (
          name, description, welcome_message, navigation_message,
          primary_color, text_color, background_color, chat_icon,
          position, margin_x, margin_y, stats_multiplier,
          knowledge_base_text, store_url
        ) VALUES (
          'چت‌بات نمونه', 
          'یک چت‌بات کامل برای تست عملکرد سیستم',
          'سلام! به چت‌بات نمونه خوش آمدید. چطور می‌توانم به شما کمک کنم؟',
          'لطفاً یکی از گزینه‌های زیر را انتخاب کنید یا سوال خود را بپرسید:',
          '#2563eb', '#ffffff', '#f8fafc', '🤖',
          'bottom-right', 20, 20, 1.0,
          'این یک چت‌بات نمونه است که برای تست سیستم طراحی شده. ما خدمات مختلفی ارائه می‌دهیم.',
          'https://example.com/store'
        )
        RETURNING id
      `)

      const chatbotId = chatbotResult.rows[0].id

      // Create admin user
      await pool.query(
        `
        INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
        VALUES ($1, 'admin', $2, 'مدیر سیستم', 'admin@example.com', true)
      `,
        [chatbotId, hashedPassword],
      )

      console.log("✅ Sample chatbot and admin user created successfully")
      console.log("🔑 Admin login: username=admin, password=admin123")
    }

    console.log("🎉 Database auto-initialization completed successfully!")
  } catch (error) {
    console.error("❌ Database auto-initialization failed:", error.message)
  } finally {
    await pool.end()
  }
}

// Run initialization
initializeDatabase().catch(console.error)
