/**
 * Robust Postgres helper built on @neondatabase/serverless.
 * - Flexible env resolution (POSTGRES_URL, DATABASE_URL, etc.).
 * - Safe during Next build: does NOT throw at import-time. It only throws
 *   when a query is executed without a valid connection string.
 * - Exposes both `sql` and `getSql()` for compatibility with existing routes.
 *
 * No changes to UI or deployment structure are required.
 */

import { neon } from "@neondatabase/serverless"

// Try to find a connection string in common env vars (Liara, Neon, etc.)
function resolveConnectionString(): { url: string | null; source: string | null } {
  const candidates: Array<[string, string | undefined]> = [
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["POSTGRES_PRISMA_URL", process.env.POSTGRES_PRISMA_URL],
    ["POSTGRES_URL_NON_POOLING", process.env.POSTGRES_URL_NON_POOLING],
    ["POSTGRES_URL_NO_SSL", process.env.POSTGRES_URL_NO_SSL],
    ["DATABASE_URL_UNPOOLED", process.env.DATABASE_URL_UNPOOLED],
  ]

  for (const [name, value] of candidates) {
    if (value && value.trim()) return { url: value, source: name }
  }

  // Compose from discrete PG* vars if provided
  const host =
    process.env.PGHOST_UNPOOLED ||
    process.env.PGHOST ||
    process.env.POSTGRES_HOST
  const user = process.env.PGUSER || process.env.POSTGRES_USER
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE
  const port = process.env.PGPORT || "5432"

  if (host && user && password && database) {
    const enc = (s: string) => encodeURIComponent(s)
    let url = `postgresql://${enc(user)}:${enc(password)}@${host}:${port}/${database}`
    const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(host)
    const hasParams = url.includes("?")
    if (!isLocal && !url.includes("sslmode=")) {
      url += hasParams ? "&sslmode=require" : "?sslmode=require"
    }
    return { url, source: "PG_* composed" }
  }

  return { url: null, source: null }
}

// Internal state
type NeonSql = ReturnType<typeof neon>
let _sql: NeonSql | null = null
let _activeSource: string | null = null

// Create a deferred sql function that only throws if executed without config
function createDeferredSql(): NeonSql {
  const fn: any = async () => {
    throw new Error(
      "Database connection string is missing at runtime. Set one of: POSTGRES_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL, DATABASE_URL_UNPOOLED, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE."
    )
  }
  return fn
}

export function getSql(): NeonSql {
  if (_sql) return _sql
  const { url, source } = resolveConnectionString()
  _activeSource = source
  if (!url) {
    // Don't crash at import/compile time; defer error to first execution
    _sql = createDeferredSql()
    return _sql
  }
  _sql = neon(url)
  return _sql
}

// Export a lazily-resolving sql tag for compatibility
export const sql: NeonSql = ((...args: any[]) => {
  const client = getSql() as any
  return client(...args)
}) as any

// Diagnostics helper (never leaks secret — only shows which var name was used)
export function getActiveDbEnvVar(): string | null {
  if (!_activeSource) {
    const { source } = resolveConnectionString()
    _activeSource = source
  }
  return _activeSource
}

// ---------- Types ----------
export interface Chatbot {
  id: number
  name: string
  created_at: string
  updated_at: string
  primary_color: string
  text_color: string
  background_color: string
  chat_icon: string
  position: string
  margin_x: number
  margin_y: number
  deepseek_api_key: string | null
  welcome_message: string
  navigation_message: string
  knowledge_base_text: string | null
  knowledge_base_url: string | null
  store_url: string | null
  ai_url: string | null
  stats_multiplier: number
}

interface SaveMessagePayload {
  chatbot_id: number
  user_message: string
  bot_response?: string | null
  user_ip?: string | null
  user_agent?: string | null
}

// ---------- Health ----------
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const s = getSql()
    await s`SELECT 1 as ok`
    return { success: true, message: "Database connection successful" }
  } catch (err: any) {
    return { success: false, message: `Connection error: ${err}` }
  }
}

// ---------- Schema Init (idempotent) ----------
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const s = getSql()

    await s`
      CREATE TABLE IF NOT EXISTS chatbots (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
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

    await s`
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

    await s`
      CREATE TABLE IF NOT EXISTS chatbot_faqs (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT,
        emoji VARCHAR(10) DEFAULT '❓',
        position INTEGER DEFAULT 0
      )
    `

    await s`
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

    await s`
      CREATE TABLE IF NOT EXISTS chatbot_options (
        id SERIAL PRIMARY KEY,
        chatbot_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        label VARCHAR(255) NOT NULL,
        emoji TEXT,
        position INTEGER DEFAULT 0
      )
    `

    await s`
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

    await s`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `

    await s`
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

    await s`
      CREATE TABLE IF NOT EXISTS chatbot_admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
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

// ---------- Queries & Helpers ----------
export async function getAllChatbots() {
  const s = getSql()
  const res = await s`SELECT * FROM chatbots ORDER BY created_at DESC`
  return res.rows
}

export async function getChatbots(): Promise<any[]> {
  const s = getSql()
  try {
    const r = await s`
      SELECT 
        id, 
        name, 
        created_at, 
        updated_at,
        primary_color,
        text_color,
        background_color,
        chat_icon,
        position,
        margin_x,
        margin_y,
        welcome_message,
        navigation_message,
        knowledge_base_text,
        knowledge_base_url,
        store_url,
        ai_url,
        deepseek_api_key,
        COALESCE(stats_multiplier, 1.0) as stats_multiplier
      FROM chatbots 
      ORDER BY created_at DESC
    `
    return r.rows
  } catch (error: any) {
    if (String(error?.message || "").includes("column") && String(error?.message || "").includes("does not exist")) {
      await s`ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS stats_multiplier NUMERIC(5,2) DEFAULT 1.0`
      await s`ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS margin_x INTEGER DEFAULT 20`
      await s`ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS margin_y INTEGER DEFAULT 20`
      const r2 = await s`
        SELECT 
          id, name, created_at, updated_at, primary_color, text_color, background_color,
          chat_icon, position, margin_x, margin_y, welcome_message, navigation_message,
          knowledge_base_text, knowledge_base_url, store_url, ai_url, deepseek_api_key,
          COALESCE(stats_multiplier, 1.0) as stats_multiplier
        FROM chatbots
        ORDER BY created_at DESC
      `
      return r2.rows
    }
    throw error
  }
}

export async function getChatbotById(id: number) {
  const s = getSql()
  const r = await s`SELECT *, COALESCE(stats_multiplier, 1.0) as stats_multiplier FROM chatbots WHERE id = ${id}`
  return r.rows[0] || null
}

export async function createChatbot(data: {
  name: string
  welcome_message?: string
  navigation_message?: string
  primary_color?: string
  text_color?: string
  background_color?: string
  chat_icon?: string
  position?: string
  margin_x?: number
  margin_y?: number
  deepseek_api_key?: string
  knowledge_base_text?: string
  knowledge_base_url?: string
  store_url?: string
  ai_url?: string
  stats_multiplier?: number
}) {
  const s = getSql()
  const res = await s`
    INSERT INTO chatbots (
      name, welcome_message, navigation_message, primary_color, text_color, 
      background_color, chat_icon, position, margin_x, margin_y, deepseek_api_key,
      knowledge_base_text, knowledge_base_url, store_url, ai_url, stats_multiplier,
      created_at, updated_at
    ) VALUES (
      ${data.name.trim()},
      ${data.welcome_message || "سلام! چطور می‌توانم به شما کمک کنم؟"},
      ${data.navigation_message || "چه چیزی شما را به اینجا آورده است؟"},
      ${data.primary_color || "#14b8a6"},
      ${data.text_color || "#ffffff"},
      ${data.background_color || "#f3f4f6"},
      ${data.chat_icon || "💬"},
      ${data.position || "bottom-right"},
      ${data.margin_x ?? 20},
      ${data.margin_y ?? 20},
      ${data.deepseek_api_key || null},
      ${data.knowledge_base_text || null},
      ${data.knowledge_base_url || null},
      ${data.store_url || null},
      ${data.ai_url || null},
      ${data.stats_multiplier ?? 1.0},
      NOW(), NOW()
    )
    RETURNING *
  `
  return res.rows[0]
}

export async function updateChatbot(id: number, data: any) {
  const s = getSql()
  const r = await s`
    UPDATE chatbots SET
      name = COALESCE(${data.name}, name),
      primary_color = COALESCE(${data.primary_color}, primary_color),
      text_color = COALESCE(${data.text_color}, text_color),
      background_color = COALESCE(${data.background_color}, background_color),
      chat_icon = COALESCE(${data.chat_icon}, chat_icon),
      position = COALESCE(${data.position}, position),
      margin_x = COALESCE(${data.margin_x}, margin_x),
      margin_y = COALESCE(${data.margin_y}, margin_y),
      welcome_message = COALESCE(${data.welcome_message}, welcome_message),
      navigation_message = COALESCE(${data.navigation_message}, navigation_message),
      knowledge_base_text = COALESCE(${data.knowledge_base_text}, knowledge_base_text),
      knowledge_base_url = COALESCE(${data.knowledge_base_url}, knowledge_base_url),
      store_url = COALESCE(${data.store_url}, store_url),
      ai_url = COALESCE(${data.ai_url}, ai_url),
      stats_multiplier = COALESCE(${data.stats_multiplier}, stats_multiplier),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return r.rows[0] || null
}

export async function deleteChatbot(id: number): Promise<boolean> {
  const s = getSql()
  await s`DELETE FROM chatbots WHERE id = ${id}`
  return true
}

// FAQs
export async function getChatbotFAQs(chatbotId: number): Promise<any[]> {
  const s = getSql()
  const result = await s`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY position ASC`
  return result.rows
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]): Promise<any[]> {
  const s = getSql()
  await s`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`
  const saved: any[] = []
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i]
    const r = await s`
      INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
      VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${faq.emoji || "❓"}, ${i})
      RETURNING *
    `
    if (r.rows[0]) saved.push(r.rows[0])
  }
  return saved
}

// Products
export async function getChatbotProducts(chatbotId: number): Promise<any[]> {
  const s = getSql()
  const result = await s`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY position ASC`
  return result.rows
}

export async function syncChatbotProducts(chatbotId: number, products: any[]): Promise<any[]> {
  const s = getSql()
  await s`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`
  const saved: any[] = []
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const r = await s`
      INSERT INTO chatbot_products (
        chatbot_id, name, description, price, image_url, 
        button_text, secondary_text, product_url, position
      )
      VALUES (
        ${chatbotId}, ${p.name}, ${p.description || null}, 
        ${p.price || null}, ${p.image_url || null}, ${p.button_text || "خرید"}, 
        ${p.secondary_text || "جزئیات"}, ${p.product_url || null}, ${i}
      )
      RETURNING *
    `
    if (r.rows[0]) saved.push(r.rows[0])
  }
  return saved
}

// Options
export async function getChatbotOptions(chatbotId: number): Promise<any[]> {
  const s = getSql()
  const result = await s`
    SELECT * FROM chatbot_options WHERE chatbot_id = ${chatbotId} ORDER BY position ASC
  `
  return result.rows
}

export async function createChatbotOption(option: Omit<any, "id">): Promise<any> {
  const s = getSql()
  const r =
    await s`INSERT INTO chatbot_options (chatbot_id, label, emoji, position) VALUES (${option.chatbot_id}, ${option.label}, ${option.emoji}, ${option.position}) RETURNING *`
  return r.rows[0]
}

export async function deleteChatbotOption(id: number): Promise<boolean> {
  const s = getSql()
  await s`DELETE FROM chatbot_options WHERE id = ${id}`
  return true
}

// Messages analytics (subset)
export async function saveMessage(payload: SaveMessagePayload) {
  const s = getSql()
  const res = await s`
    INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp)
    VALUES (${payload.chatbot_id}, ${payload.user_message}, ${payload.bot_response || null},
            ${payload.user_ip || null}, ${payload.user_agent || null}, NOW())
    RETURNING id
  `
  return res.rows[0]?.id
}

export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  const s = getSql()
  const r = await s`
    SELECT COUNT(*)::int AS total FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
  `
  return Number(r.rows?.[0]?.total ?? 0)
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  const s = getSql()
  const r = await s`
    SELECT COUNT(DISTINCT user_ip)::int AS unique_users
    FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
  `
  return Number(r.rows?.[0]?.unique_users ?? 0)
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  const s = getSql()
  const r = await s`
    SELECT COALESCE(ROUND((COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_ip),0)), 2), 0) AS avg_messages
    FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
  `
  return Number(r.rows?.[0]?.avg_messages ?? 0)
}

export async function getMessageCountByDay(
  chatbotId: number,
  days = 7
): Promise<{ date: string; count: number }[]> {
  const s = getSql()
  const r = await s`
    SELECT DATE(timestamp)::text AS date, COUNT(*)::int AS count
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(timestamp) ORDER BY date DESC
  `
  return r.rows
}

export async function getMessageCountByWeek(
  chatbotId: number,
  weeks = 4
): Promise<{ week: string; count: number }[]> {
  const s = getSql()
  const r = await s`
    SELECT DATE_TRUNC('week', timestamp)::text AS week, COUNT(*)::int AS count
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${weeks} weeks'
    GROUP BY DATE_TRUNC('week', timestamp) ORDER BY week DESC
  `
  return r.rows
}

export async function getMessageCountByMonth(
  chatbotId: number,
  months = 6
): Promise<{ month: string; count: number }[]> {
  const s = getSql()
  const r = await s`
    SELECT DATE_TRUNC('month', timestamp)::text AS month, COUNT(*)::int AS count
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${months} months'
    GROUP BY DATE_TRUNC('month', timestamp) ORDER BY month DESC
  `
  return r.rows
}

export async function getTopUserQuestions(
  chatbotId: number,
  limit = 10
): Promise<{ question: string; frequency: number }[]> {
  const s = getSql()
  const r = await s`
    SELECT user_message as question, COUNT(*)::int as frequency
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND LENGTH(user_message) > 5
    GROUP BY user_message ORDER BY frequency DESC LIMIT ${limit}
  `
  return r.rows
}
