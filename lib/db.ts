/**
 * Robust PostgreSQL helper powered by 'pg' (Node Postgres), not Neon.
 * - Works with a standard PostgreSQL connection string (e.g., Liara).
 * - Safe during Next build: does NOT throw at import-time.
 * - Exposes `sql` tagged-template and `getSql()` compatible with prior usage.
 *
 * Set DATABASE_URL (recommended) to your URL, e.g.:
 * postgresql://root:muSavifLXtkhfROJFEBJQqaB@agitated-murdock-inwia4a8a-db:5432/postgres
 * If TLS is required by your provider, append ?sslmode=require
 */

import { Pool, type PoolConfig, type QueryResult } from "pg"
import bcrypt from "bcrypt"

// Added TypeScript interfaces for database entities
export interface Chatbot {
  id: number
  name: string
  description?: string
  created_at: Date
  updated_at: Date
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  deepseek_api_key?: string
  welcome_message: string
  navigation_message: string
  knowledge_base_text?: string
  knowledge_base_url?: string
  store_url?: string
  ai_url?: string
  stats_multiplier: number
}

export interface ChatbotFAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string
  emoji: string
  position: number
}

export interface ChatbotProduct {
  id: number
  chatbot_id: number
  name: string
  description?: string
  image_url?: string
  price?: number
  position: number
  button_text: string
  secondary_text: string
  product_url?: string
}

export interface ChatbotOption {
  id: number
  chatbot_id: number
  label: string
  emoji?: string
  position: number
}

// Resolve connection string from common envs or compose from PG* vars
const CANDIDATES = [
  "POSTGRES_URL",
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "DATABASE_URL_UNPOOLED",
] as const

let pool: Pool | null = null
let usedEnvKey: string | undefined

function pickConnectionString(): { url?: string; usedEnv?: string } {
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
    const enc = (s: string) => encodeURIComponent(s)
    const pass = password ? `:${enc(password)}` : ""
    const url = `postgresql://${enc(user)}${pass}@${host}:${port}/${enc(database)}`
    return { url, usedEnv: "PGHOST/PGUSER/PGPASSWORD/PGDATABASE" }
  }
  return {}
}

function shouldEnableSSL(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    const mode = u.searchParams.get("sslmode")
    if (mode && mode.toLowerCase() === "require") return true
    if (process.env.PGSSLMODE && process.env.PGSSLMODE.toLowerCase() === "require") return true
  } catch {
    // ignore
  }
  return false
}

function getPool(): Pool {
  if (pool) return pool
  const { url, usedEnv } = pickConnectionString()
  usedEnvKey = usedEnv
  if (!url) {
    // Create ended pool placeholder to avoid repeated init; queries will throw in runQuery.
    pool = new Pool({} as PoolConfig)
    void pool.end()
    return pool
  }
  const cfg: PoolConfig = {
    connectionString: url,
    ssl: shouldEnableSSL(url) ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT || 10000),
  }
  pool = new Pool(cfg)
  return pool
}

function toParamQuery(strings: TemplateStringsArray, values: any[]) {
  let text = ""
  for (let i = 0; i < strings.length - 1; i++) {
    text += strings[i] + `$${i + 1}`
  }
  text += strings[strings.length - 1]
  return { text, values }
}

async function runQuery(text: string, values: any[] = []) {
  const { url } = pickConnectionString()
  if (!url) {
    throw new Error(
      "Database connection string is missing at runtime. Set one of: POSTGRES_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL, DATABASE_URL_UNPOOLED, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE.",
    )
  }
  const p = getPool()
  return p.query(text, values)
}

export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<any>> {
  const { text, values: params } = toParamQuery(strings, values)
  return runQuery(text, params)
}

// For compatibility with code doing: const s = getSql(); await s`...`
export function getSql() {
  const tag = async (strings: TemplateStringsArray, ...values: any[]) => sql(strings, ...values)
  ;(tag as any).query = (text: string, params?: any[]) => runQuery(text, params)
  return tag
}

export function getActiveDbEnvVar(): string | null {
  if (usedEnvKey === undefined) {
    const { usedEnv } = pickConnectionString()
    usedEnvKey = usedEnv
  }
  return usedEnvKey ?? null
}

// Added prisma compatibility object for legacy code
export const prisma = {
  chatbot: {
    findMany: async () => getAllChatbots(),
    findUnique: async ({ where }: { where: { id: number } }) => getChatbotById(where.id),
    create: async ({ data }: { data: any }) => createChatbot(data),
  },
}

// ---------- Diagnostics & Initialization ----------

export async function testDatabaseConnection(): Promise<{ ok: boolean; usingEnvVar?: string; error?: string }> {
  try {
    const r = await runQuery("SELECT 1 as ok", [])
    return { ok: r.rows[0]?.ok === 1, usingEnvVar: usedEnvKey }
  } catch (e: any) {
    return { ok: false, usingEnvVar: usedEnvKey, error: String(e?.message || e) }
  }
}

// Added checkDatabaseConnection alias for compatibility
export const checkDatabaseConnection = testDatabaseConnection

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        primary_color VARCHAR(50) DEFAULT '#14b8a6',
        text_color VARCHAR(50) DEFAULT '#ffffff',
        background_color VARCHAR(50) DEFAULT '#f3f4f6',
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
    `
    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        user_message TEXT NOT NULL,
        bot_response TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        user_ip VARCHAR(50),
        user_agent TEXT
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT,
        emoji VARCHAR(10) DEFAULT '❓',
        position INTEGER DEFAULT 0
      )
    `
    await sql`
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
    `
    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_options (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        label VARCHAR(255) NOT NULL,
        emoji TEXT,
        position INTEGER DEFAULT 0
      )
    `
    await sql`
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
    `
    await sql`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `
    await sql`
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
    `
    await sql`
      CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES chatbot_admin_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_messages_chatbot_id ON chatbot_messages(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_chatbot_id ON chatbot_faqs(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_products_chatbot_id ON chatbot_products(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_options_chatbot_id ON chatbot_options(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_chatbot_id ON tickets(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id)`

    const existingChatbots = await sql`SELECT COUNT(*) as count FROM chatbots`
    if (existingChatbots.rows[0].count === 0) {
      // Create sample chatbot
      const chatbotResult = await sql`
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
      `
      const chatbotId = chatbotResult.rows[0].id

      // Create sample FAQs
      const faqs = [
        {
          question: "ساعات کاری شما چیست؟",
          answer: "ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.",
          emoji: "🕒",
        },
        {
          question: "چگونه می‌توانم سفارش دهم؟",
          answer: "شما می‌توانید از طریق وب‌سایت ما یا تماس تلفنی سفارش خود را ثبت کنید.",
          emoji: "🛒",
        },
        {
          question: "آیا ارسال رایگان دارید؟",
          answer: "بله، برای سفارش‌های بالای ۵۰۰ هزار تومان ارسال رایگان است.",
          emoji: "🚚",
        },
        {
          question: "چگونه می‌توانم با پشتیبانی تماس بگیرم؟",
          answer: "شما می‌توانید از طریق همین چت‌بات، ایمیل یا تلفن با ما در ارتباط باشید.",
          emoji: "📞",
        },
        {
          question: "آیا امکان مرجوعی کالا وجود دارد؟",
          answer: "بله، تا ۷ روز پس از خرید امکان مرجوعی کالا وجود دارد.",
          emoji: "↩️",
        },
        {
          question: "روش‌های پرداخت چیست؟",
          answer: "ما پرداخت آنلاین، کارت به کارت و پرداخت در محل را پذیرش می‌کنیم.",
          emoji: "💳",
        },
      ]

      for (let i = 0; i < faqs.length; i++) {
        await sql`
          INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
          VALUES (${chatbotId}, ${faqs[i].question}, ${faqs[i].answer}, ${faqs[i].emoji}, ${i})
        `
      }

      // Create sample products
      const products = [
        {
          name: "محصول ویژه A",
          description: "بهترین محصول ما با کیفیت عالی",
          price: 299000,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "محصول پرفروش B",
          description: "محصولی که همه دوست دارند",
          price: 199000,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "محصول جدید C",
          description: "آخرین محصول ما با تکنولوژی روز",
          price: 399000,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "محصول اقتصادی D",
          description: "کیفیت خوب با قیمت مناسب",
          price: 99000,
          image_url: "/placeholder.svg?height=200&width=200",
        },
      ]

      for (let i = 0; i < products.length; i++) {
        await sql`
          INSERT INTO chatbot_products (chatbot_id, name, description, price, image_url, position, button_text, secondary_text)
          VALUES (${chatbotId}, ${products[i].name}, ${products[i].description}, ${products[i].price}, ${products[i].image_url}, ${i}, 'مشاهده محصول', 'جزئیات بیشتر')
        `
      }

      // Create sample quick options
      const options = [
        { label: "درباره ما", emoji: "🏢" },
        { label: "محصولات", emoji: "📦" },
        { label: "پشتیبانی", emoji: "🎧" },
        { label: "سفارش‌های من", emoji: "📋" },
        { label: "تماس با ما", emoji: "📞" },
        { label: "راهنمای خرید", emoji: "📚" },
      ]

      for (let i = 0; i < options.length; i++) {
        await sql`
          INSERT INTO chatbot_options (chatbot_id, label, emoji, position)
          VALUES (${chatbotId}, ${options[i].label}, ${options[i].emoji}, ${i})
        `
      }

      // Create sample admin user (username: admin, password: admin123)
      const hashedPassword = await bcrypt.hash("admin123", 10)
      await sql`
        INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
        VALUES (${chatbotId}, 'admin', ${hashedPassword}, 'مدیر سیستم', 'admin@example.com', true)
      `

      // Create sample messages
      await sql`
        INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip)
        VALUES 
        (${chatbotId}, 'سلام', 'سلام! به چت‌بات نمونه خوش آمدید. چطور می‌توانم به شما کمک کنم؟', '127.0.0.1'),
        (${chatbotId}, 'محصولات شما چیست؟', 'ما محصولات متنوعی داریم. می‌توانید از بخش محصولات دیدن کنید یا سوال خاصی بپرسید.', '127.0.0.1')
      `

      // Create sample ticket
      const ticketResult = await sql`
        INSERT INTO tickets (chatbot_id, name, email, phone, subject, message, status, priority)
        VALUES (${chatbotId}, 'کاربر نمونه', 'user@example.com', '09123456789', 'سوال درباره محصول', 'سلام، می‌خواستم درباره محصول A سوال بپرسم.', 'open', 'normal')
        RETURNING id
      `
      const ticketId = ticketResult.rows[0].id

      await sql`
        INSERT INTO ticket_responses (ticket_id, message, is_admin)
        VALUES (${ticketId}, 'سلام، ممنون از تماس شما. لطفاً سوال خود را مطرح کنید.', true)
      `
    }

    return { success: true, message: "Database initialized successfully with sample data" }
  } catch (err: any) {
    return { success: false, message: `Database initialization error: ${err}` }
  }
}

// ---------- Helper functions for existing routes ----------

export async function getAllChatbots(): Promise<Chatbot[]> {
  const r = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
  return r.rows
}

export async function createChatbot(data: { name: string; description?: string | null }): Promise<Chatbot> {
  const r = await sql`
    INSERT INTO chatbots (name, description, created_at, updated_at)
    VALUES (${data.name}, ${data.description ?? null}, NOW(), NOW())
    RETURNING *
  `
  return r.rows[0]
}

export async function getChatbots(): Promise<Chatbot[]> {
  const r = await sql`
    SELECT 
      id, name, created_at, updated_at,
      primary_color, text_color, background_color, chat_icon,
      position, margin_x, margin_y,
      welcome_message, navigation_message,
      knowledge_base_text, knowledge_base_url, store_url, ai_url, deepseek_api_key,
      COALESCE(stats_multiplier, 1.0) as stats_multiplier
    FROM chatbots
    ORDER BY created_at DESC
  `
  return r.rows
}

// Added all missing helper functions for analytics and data retrieval
export async function getChatbotById(id: number): Promise<Chatbot | null> {
  const r = await sql`SELECT * FROM chatbots WHERE id = ${id}`
  return r.rows[0] || null
}

export async function getChatbotFAQs(chatbotId: number): Promise<ChatbotFAQ[]> {
  const r = await sql`
    SELECT * FROM chatbot_faqs 
    WHERE chatbot_id = ${chatbotId} 
    ORDER BY position ASC
  `
  return r.rows
}

export async function getChatbotProducts(chatbotId: number): Promise<ChatbotProduct[]> {
  const r = await sql`
    SELECT * FROM chatbot_products 
    WHERE chatbot_id = ${chatbotId} 
    ORDER BY position ASC
  `
  return r.rows
}

export async function getChatbotOptions(chatbotId: number): Promise<ChatbotOption[]> {
  const r = await sql`
    SELECT * FROM chatbot_options 
    WHERE chatbot_id = ${chatbotId} 
    ORDER BY position ASC
  `
  return r.rows
}

export async function getMessageCountByDay(chatbotId: number, days = 7): Promise<any[]> {
  const r = await sql`
    SELECT 
      DATE(timestamp) as date,
      COUNT(*) as count
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId} 
      AND timestamp >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(timestamp)
    ORDER BY date DESC
  `
  return r.rows
}

export async function getMessageCountByWeek(chatbotId: number, weeks = 4): Promise<any[]> {
  const r = await sql`
    SELECT 
      DATE_TRUNC('week', timestamp) as week,
      COUNT(*) as count
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId} 
      AND timestamp >= NOW() - INTERVAL '${weeks} weeks'
    GROUP BY DATE_TRUNC('week', timestamp)
    ORDER BY week DESC
  `
  return r.rows
}

export async function getMessageCountByMonth(chatbotId: number, months = 6): Promise<any[]> {
  const r = await sql`
    SELECT 
      DATE_TRUNC('month', timestamp) as month,
      COUNT(*) as count
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId} 
      AND timestamp >= NOW() - INTERVAL '${months} months'
    GROUP BY DATE_TRUNC('month', timestamp)
    ORDER BY month DESC
  `
  return r.rows
}

export async function getTopUserQuestions(chatbotId: number, limit = 10): Promise<any[]> {
  const r = await sql`
    SELECT 
      user_message,
      COUNT(*) as frequency
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
      AND user_message IS NOT NULL
      AND LENGTH(user_message) > 3
    GROUP BY user_message
    ORDER BY frequency DESC
    LIMIT ${limit}
  `
  return r.rows
}

export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COUNT(*) as count 
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
  `
  return Number.parseInt(r.rows[0].count)
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COUNT(DISTINCT user_ip) as count 
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
      AND user_ip IS NOT NULL
  `
  return Number.parseInt(r.rows[0].count)
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT 
      CASE 
        WHEN COUNT(DISTINCT user_ip) = 0 THEN 0
        ELSE COUNT(*)::float / COUNT(DISTINCT user_ip)
      END as avg_messages
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
      AND user_ip IS NOT NULL
  `
  return Number.parseFloat(r.rows[0].avg_messages) || 0
}
