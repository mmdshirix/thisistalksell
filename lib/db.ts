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
import bcrypt from "bcryptjs"

export interface Chatbot {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  primary_color: string | null
  text_color: string | null
  background_color: string | null
  chat_icon: string | null
  position: string | null
  margin_x: number | null
  margin_y: number | null
  deepseek_api_key: string | null
  welcome_message: string | null
  navigation_message: string | null
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: string | null
}

export interface ChatbotFAQ {
  id: number
  chatbot_id: number
  question: string
  answer: string | null
  emoji: string | null
  position: number
}

export interface ChatbotProduct {
  id: number
  chatbot_id: number
  name: string
  description: string | null
  image_url: string | null
  price: number | null
  position: number
  button_text: string | null
  secondary_text: string | null
  product_url: string | null
}

export interface ChatbotOption {
  id: number
  chatbot_id: number
  label: string
  emoji: string | null
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

// ---------- Diagnostics & Initialization ----------

export async function testDatabaseConnection(): Promise<{ ok: boolean; usingEnvVar?: string; error?: string }> {
  try {
    const r = await runQuery("SELECT 1 as ok", [])
    return { ok: r.rows[0]?.ok === 1, usingEnvVar: usedEnvKey }
  } catch (e: any) {
    return { ok: false, usingEnvVar: usedEnvKey, error: String(e?.message || e) }
  }
}

export const checkDatabaseConnection = testDatabaseConnection

export const prisma = {
  $disconnect: async () => {
    if (pool) {
      await pool.end()
      pool = null
    }
  },
}

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

    return { success: true, message: "Database initialized successfully" }
  } catch (err: any) {
    return { success: false, message: `Database initialization error: ${err}` }
  }
}

// ---------- Minimal helpers used by existing routes ----------

export async function getAllChatbots() {
  const r = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
  return r.rows
}

export async function createChatbot(data: { name: string; description?: string | null }) {
  const r = await sql`
    INSERT INTO chatbots (name, description, created_at, updated_at)
    VALUES (${data.name}, ${data.description ?? null}, NOW(), NOW())
    RETURNING *
  `
  return r.rows[0]
}

export async function getChatbots() {
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

export async function getChatbotById(id: number): Promise<Chatbot | null> {
  const r = await sql`SELECT * FROM chatbots WHERE id = ${id}`
  return r.rows[0] || null
}

export async function getChatbotFAQs(chatbotId: number): Promise<ChatbotFAQ[]> {
  const r = await sql`
    SELECT * FROM chatbot_faqs 
    WHERE chatbot_id = ${chatbotId} 
    ORDER BY position ASC, id ASC
  `
  return r.rows
}

export async function getChatbotProducts(chatbotId: number): Promise<ChatbotProduct[]> {
  const r = await sql`
    SELECT * FROM chatbot_products 
    WHERE chatbot_id = ${chatbotId} 
    ORDER BY position ASC, id ASC
  `
  return r.rows
}

export async function getChatbotOptions(chatbotId: number): Promise<ChatbotOption[]> {
  const r = await sql`
    SELECT * FROM chatbot_options 
    WHERE chatbot_id = ${chatbotId} 
    ORDER BY position ASC, id ASC
  `
  return r.rows
}

export async function getMessageCountByDay(chatbotId: number, days = 30) {
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

export async function getMessageCountByWeek(chatbotId: number, weeks = 12) {
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

export async function getMessageCountByMonth(chatbotId: number, months = 12) {
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

export async function getTopUserQuestions(chatbotId: number, limit = 10) {
  const r = await sql`
    SELECT 
      user_message,
      COUNT(*) as frequency
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
      AND user_message IS NOT NULL
      AND LENGTH(user_message) > 5
    GROUP BY user_message
    ORDER BY frequency DESC
    LIMIT ${limit}
  `
  return r.rows
}

export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COUNT(*) as total
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
  `
  return Number.parseInt(r.rows[0]?.total || "0")
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COUNT(DISTINCT user_ip) as unique_users
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
      AND user_ip IS NOT NULL
  `
  return Number.parseInt(r.rows[0]?.unique_users || "0")
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT 
      CASE 
        WHEN COUNT(DISTINCT user_ip) > 0 
        THEN ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_ip), 2)
        ELSE 0 
      END as avg_messages
    FROM chatbot_messages 
    WHERE chatbot_id = ${chatbotId}
      AND user_ip IS NOT NULL
  `
  return Number.parseFloat(r.rows[0]?.avg_messages || "0")
}

export async function createCompleteSampleChatbot(): Promise<{ success: boolean; message: string; chatbot?: any }> {
  try {
    // Check if sample chatbot already exists
    const existingCheck = await sql`SELECT id FROM chatbots WHERE name = 'نمونه چت‌بات پشتیبانی' LIMIT 1`
    if (existingCheck.rows.length > 0) {
      return {
        success: true,
        message: "Sample chatbot already exists",
        chatbot: { id: existingCheck.rows[0].id },
      }
    }

    // Create the main chatbot
    const chatbot = await createChatbot({
      name: "نمونه چت‌بات پشتیبانی",
      description: "چت‌بات نمونه با تمام امکانات برای تست سیستم",
    })

    // Create sample FAQs
    const faqs = [
      {
        question: "ساعات کاری شما چیست؟",
        answer: "ما از شنبه تا چهارشنبه از ساعت 9 صبح تا 6 عصر در خدمت شما هستیم.",
        emoji: "🕒",
        position: 1,
      },
      {
        question: "چگونه می‌توانم با پشتیبانی تماس بگیرم؟",
        answer: "می‌توانید از طریق این چت، ایمیل support@company.com یا تلفن 021-12345678 با ما تماس بگیرید.",
        emoji: "📞",
        position: 2,
      },
      {
        question: "سیاست بازگشت کالا چیست؟",
        answer: "شما می‌توانید تا 30 روز پس از خرید، کالای خود را در صورت عدم استفاده و داشتن بسته‌بندی اصلی بازگردانید.",
        emoji: "↩️",
        position: 3,
      },
    ]

    for (const faq of faqs) {
      await sql`
        INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
        VALUES (${chatbot.id}, ${faq.question}, ${faq.answer}, ${faq.emoji}, ${faq.position})
      `
    }

    // Create sample products
    const products = [
      {
        name: "پلن پشتیبانی طلایی",
        description: "پشتیبانی 24/7 با مدیر اختصاصی و پاسخگویی فوری",
        price: 299000,
        button_text: "خرید",
        secondary_text: "جزئیات بیشتر",
        position: 1,
      },
      {
        name: "پلن پشتیبانی نقره‌ای",
        description: "پشتیبانی در ساعات اداری با چت و ایمیل",
        price: 149000,
        button_text: "خرید",
        secondary_text: "مشاهده ویژگی‌ها",
        position: 2,
      },
    ]

    for (const product of products) {
      await sql`
        INSERT INTO chatbot_products (chatbot_id, name, description, price, button_text, secondary_text, position)
        VALUES (${chatbot.id}, ${product.name}, ${product.description}, ${product.price}, ${product.button_text}, ${product.secondary_text}, ${product.position})
      `
    }

    // Create sample options
    const options = [
      { label: "بررسی وضعیت سفارش", emoji: "📦", position: 1 },
      { label: "سوالات مالی", emoji: "💰", position: 2 },
      { label: "پشتیبانی فنی", emoji: "🔧", position: 3 },
      { label: "ثبت شکایت", emoji: "📝", position: 4 },
    ]

    for (const option of options) {
      await sql`
        INSERT INTO chatbot_options (chatbot_id, label, emoji, position)
        VALUES (${chatbot.id}, ${option.label}, ${option.emoji}, ${option.position})
      `
    }

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 12)
    await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
      VALUES (${chatbot.id}, 'admin', ${passwordHash}, 'مدیر سیستم', 'admin@company.com', true)
    `

    // Create some sample messages
    const sampleMessages = [
      {
        user_message: "سلام، می‌خواهم وضعیت سفارشم را بدانم",
        bot_response: "سلام! برای بررسی وضعیت سفارش، لطفاً شماره سفارش خود را ارسال کنید.",
        user_ip: "192.168.1.100",
      },
      {
        user_message: "چطور می‌تونم محصولاتتون رو ببینم؟",
        bot_response: "شما می‌توانید محصولات ما را در بخش فروشگاه مشاهده کنید یا از گزینه‌های زیر استفاده کنید.",
        user_ip: "192.168.1.101",
      },
    ]

    for (const msg of sampleMessages) {
      await sql`
        INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent)
        VALUES (${chatbot.id}, ${msg.user_message}, ${msg.bot_response}, ${msg.user_ip}, 'Mozilla/5.0 (Sample Browser)')
      `
    }

    return {
      success: true,
      message: "Complete sample chatbot created successfully",
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
        adminCredentials: {
          username: "admin",
          password: "admin123",
        },
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to create sample chatbot: ${String(error?.message || error)}`,
    }
  }
}
