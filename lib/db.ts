/**
 * Robust PostgreSQL helper powered by 'pg' (Node Postgres), not Neon.
 * - Works with a standard PostgreSQL connection string (e.g., Liara).
 * - Safe during Next build: does NOT throw at import-time.
 * - Exposes `sql` tagged-template and `getSql()` compatible with prior usage.
 * - Includes commonly used high-level helpers across your routes.
 *
 * To configure on Liara, set DATABASE_URL (recommended) to:
 *   postgresql://user:password@host:5432/database
 *
 * This file intentionally avoids any UI or deployment structure changes.
 */

import { Pool, type PoolClient, type PoolConfig, type QueryResult } from "pg"

// ------------------------- Connection Resolution -------------------------

function resolveConnectionString(): { url: string | null; source: string | null; ssl: PoolConfig["ssl"] } {
  const candidates: Array<[string, string | undefined]> = [
    ["POSTGRES_URL", process.env.POSTGRES_URL],
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["POSTGRES_PRISMA_URL", process.env.POSTGRES_PRISMA_URL],
    ["POSTGRES_URL_NON_POOLING", process.env.POSTGRES_URL_NON_POOLING],
    ["POSTGRES_URL_NO_SSL", process.env.POSTGRES_URL_NO_SSL],
    ["DATABASE_URL_UNPOOLED", process.env.DATABASE_URL_UNPOOLED],
  ]

  for (const [name, value] of candidates) {
    if (value && value.trim()) {
      const { ssl } = deriveSslFromUrl(value)
      return { url: value, source: name, ssl }
    }
  }

  // Compose from discrete PG* vars
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
    const url = `postgresql://${enc(user)}:${enc(password)}@${host}:${port}/${database}`
    const { ssl } = deriveSslFromUrl(url)
    return { url, source: "PG_* composed", ssl }
  }

  return { url: null, source: null, ssl: undefined }
}

// If connection string contains sslmode=require, configure pg SSL.
// Otherwise, do not force SSL (Liara internal DB usually doesn't need it).
function deriveSslFromUrl(url: string): { ssl: PoolConfig["ssl"] } {
  try {
    const u = new URL(url)
    const sslmode = u.searchParams.get("sslmode")
    if (sslmode && sslmode.toLowerCase() === "require") {
      return { ssl: { rejectUnauthorized: false } }
    }
  } catch {
    // ignore malformed URL
  }
  return { ssl: undefined }
}

// ------------------------- Pool Singleton -------------------------

declare global {
  // eslint-disable-next-line no-var
  var __PG_POOL__: Pool | undefined
  // eslint-disable-next-line no-var
  var __PG_SOURCE__: string | null | undefined
}

function getPool(): Pool | null {
  if (globalThis.__PG_POOL__) return globalThis.__PG_POOL__
  const { url, source, ssl } = resolveConnectionString()
  globalThis.__PG_SOURCE__ = source
  if (!url) return null

  const cfg: PoolConfig = {
    connectionString: url,
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30_000),
    connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT || 10_000),
    ssl,
  }
  globalThis.__PG_POOL__ = new Pool(cfg)
  return globalThis.__PG_POOL__
}

export function getActiveDbEnvVar(): string | null {
  if (globalThis.__PG_SOURCE__ === undefined) {
    const { source } = resolveConnectionString()
    globalThis.__PG_SOURCE__ = source
  }
  return globalThis.__PG_SOURCE__ ?? null
}

// ------------------------- sql Tagged Template -------------------------

type SqlTag = (<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<QueryResult<T>>) & {
  // optional helpers can be added here
}

function buildParameterizedQuery(strings: TemplateStringsArray, values: any[]) {
  // Convert template to parameterized $1, $2, ... with values array
  let text = ""
  const params: any[] = []
  for (let i = 0; i < strings.length; i++) {
    text += strings[i]
    if (i < values.length) {
      params.push(values[i])
      text += `$${params.length}`
    }
  }
  return { text, values: params }
}

// Deferred sql that only errors when executed without configuration
async function deferredSqlExec(): Promise<QueryResult<any>> {
  throw new Error(
    "Database connection string is missing at runtime. Set one of: POSTGRES_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL, DATABASE_URL_UNPOOLED, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE."
  )
}

const sqlImpl: SqlTag = (async (strings: TemplateStringsArray, ...values: any[]) => {
  const pool = getPool()
  if (!pool) return deferredSqlExec()
  const { text, values: params } = buildParameterizedQuery(strings, values)
  const client: PoolClient = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}) as SqlTag

export const sql = sqlImpl

// getSql returns the same tagged template function for compatibility
export function getSql(): SqlTag {
  return sqlImpl
}

// ------------------------- Health & Init -------------------------

export async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const pool = getPool()
    if (!pool) {
      return {
        success: false,
        message:
          "Database connection string is missing at runtime. Set DATABASE_URL or related PG* vars.",
      }
    }
    const r = await pool.query("SELECT 1 as ok")
    if (r?.rows?.length) return { success: true, message: "Database connection successful" }
    return { success: false, message: "Database query returned no rows" }
  } catch (err: any) {
    return { success: false, message: `Connection error: ${err}` }
  }
}

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    await sql`
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

// ------------------------- High-Level Query Helpers -------------------------

export async function getAllChatbots() {
  const r = await sql`SELECT * FROM chatbots ORDER BY created_at DESC`
  return r.rows
}

export async function getChatbots() {
  try {
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
  } catch (error: any) {
    const msg = String(error?.message || "")
    if (msg.includes("column") && msg.includes("does not exist")) {
      await sql`ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS stats_multiplier NUMERIC(5,2) DEFAULT 1.0`
      await sql`ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS margin_x INTEGER DEFAULT 20`
      await sql`ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS margin_y INTEGER DEFAULT 20`
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
    throw error
  }
}

export async function getChatbotById(id: number) {
  const r = await sql`
    SELECT *, COALESCE(stats_multiplier, 1.0) as stats_multiplier
    FROM chatbots WHERE id = ${id}
  `
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
  const r = await sql`
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
  return r.rows[0]
}

export async function updateChatbot(id: number, data: any) {
  const r = await sql`
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
  await sql`DELETE FROM chatbots WHERE id = ${id}`
  return true
}

// FAQs
export async function getChatbotFAQs(chatbotId: number) {
  const r = await sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY position ASC`
  return r.rows
}

export async function syncChatbotFAQs(chatbotId: number, faqs: any[]) {
  await sql`DELETE FROM chatbot_faqs WHERE chatbot_id = ${chatbotId}`
  const saved: any[] = []
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i]
    const r = await sql`
      INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
      VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${faq.emoji || "❓"}, ${i})
      RETURNING *
    `
    if (r.rows[0]) saved.push(r.rows[0])
  }
  return saved
}

// Products
export async function getChatbotProducts(chatbotId: number) {
  const r = await sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY position ASC`
  return r.rows
}

export async function syncChatbotProducts(chatbotId: number, products: any[]) {
  await sql`DELETE FROM chatbot_products WHERE chatbot_id = ${chatbotId}`
  const saved: any[] = []
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const r = await sql`
      INSERT INTO chatbot_products (
        chatbot_id, name, description, price, image_url,
        button_text, secondary_text, product_url, position
      ) VALUES (
        ${chatbotId}, ${p.name}, ${p.description || null}, ${p.price || null}, ${p.image_url || null},
        ${p.button_text || "خرید"}, ${p.secondary_text || "جزئیات"}, ${p.product_url || null}, ${i}
      )
      RETURNING *
    `
    if (r.rows[0]) saved.push(r.rows[0])
  }
  return saved
}

// Options
export async function getChatbotOptions(chatbotId: number) {
  const r = await sql`
    SELECT * FROM chatbot_options WHERE chatbot_id = ${chatbotId} ORDER BY position ASC
  `
  return r.rows
}

export async function createChatbotOption(option: Omit<any, "id">) {
  const r = await sql`
    INSERT INTO chatbot_options (chatbot_id, label, emoji, position)
    VALUES (${option.chatbot_id}, ${option.label}, ${option.emoji}, ${option.position})
    RETURNING *
  `
  return r.rows[0]
}

export async function deleteChatbotOption(id: number): Promise<boolean> {
  await sql`DELETE FROM chatbot_options WHERE id = ${id}`
  return true
}

// Tickets (subset used by routes)
export async function createTicket(ticket: Omit<any, "id" | "created_at" | "updated_at">) {
  const r = await sql`
    INSERT INTO tickets (
      chatbot_id, name, email, phone, subject, message,
      image_url, status, priority, user_ip, user_agent, created_at, updated_at
    )
    VALUES (
      ${ticket.chatbot_id}, ${ticket.name}, ${ticket.email}, ${ticket.phone},
      ${ticket.subject}, ${ticket.message},
      ${ticket.image_url}, ${ticket.status}, ${ticket.priority},
      ${ticket.user_ip}, ${ticket.user_agent}, NOW(), NOW()
    )
    RETURNING *
  `
  return r.rows[0]
}

export async function getTicketById(ticketId: number) {
  const r = await sql`SELECT * FROM tickets WHERE id = ${ticketId}`
  return r.rows[0] || null
}

export async function getChatbotTickets(chatbotId: number) {
  const r = await sql`SELECT * FROM tickets WHERE chatbot_id = ${chatbotId} ORDER BY created_at DESC`
  return r.rows
}

export async function updateTicketStatus(ticketId: number, status: string) {
  await sql`UPDATE tickets SET status = ${status}, updated_at = NOW() WHERE id = ${ticketId}`
}

export async function getTicketResponses(ticketId: number) {
  const r = await sql`SELECT * FROM ticket_responses WHERE ticket_id = ${ticketId} ORDER BY created_at ASC`
  return r.rows
}

export async function addTicketResponse(ticketId: number, message: string, isAdmin = false) {
  await sql`
    INSERT INTO ticket_responses (ticket_id, message, is_admin, created_at)
    VALUES (${ticketId}, ${message}, ${isAdmin}, NOW())
  `
}

// Analytics
export async function saveMessage(payload: {
  chatbot_id: number
  user_message: string
  bot_response?: string | null
  user_ip?: string | null
  user_agent?: string | null
}) {
  const r = await sql`
    INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent, timestamp)
    VALUES (${payload.chatbot_id}, ${payload.user_message}, ${payload.bot_response || null},
            ${payload.user_ip || null}, ${payload.user_agent || null}, NOW())
    RETURNING id
  `
  return r.rows[0]?.id
}

export async function getTotalMessageCount(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COUNT(*)::int AS total FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
  `
  return Number(r.rows?.[0]?.total ?? 0)
}

export async function getUniqueUsersCount(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COUNT(DISTINCT user_ip)::int AS unique_users
    FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
  `
  return Number(r.rows?.[0]?.unique_users ?? 0)
}

export async function getAverageMessagesPerUser(chatbotId: number): Promise<number> {
  const r = await sql`
    SELECT COALESCE(ROUND((COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_ip),0)), 2), 0) AS avg_messages
    FROM chatbot_messages WHERE chatbot_id = ${chatbotId}
  `
  return Number(r.rows?.[0]?.avg_messages ?? 0)
}

export async function getMessageCountByDay(
  chatbotId: number,
  days = 7
): Promise<{ date: string; count: number }[]> {
  const r = await sql`
    SELECT DATE(timestamp)::text AS date, COUNT(*)::int AS count
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(timestamp) ORDER BY date DESC
  `
  return r.rows as any
}

export async function getMessageCountByWeek(
  chatbotId: number,
  weeks = 4
): Promise<{ week: string; count: number }[]> {
  const r = await sql`
    SELECT DATE_TRUNC('week', timestamp)::text AS week, COUNT(*)::int AS count
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${weeks} weeks'
    GROUP BY DATE_TRUNC('week', timestamp) ORDER BY week DESC
  `
  return r.rows as any
}

export async function getMessageCountByMonth(
  chatbotId: number,
  months = 6
): Promise<{ month: string; count: number }[]> {
  const r = await sql`
    SELECT DATE_TRUNC('month', timestamp)::text AS month, COUNT(*)::int AS count
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND timestamp >= NOW() - INTERVAL '${months} months'
    GROUP BY DATE_TRUNC('month', timestamp) ORDER BY month DESC
  `
  return r.rows as any
}

export async function getTopUserQuestions(
  chatbotId: number,
  limit = 10
): Promise<{ question: string; frequency: number }[]> {
  const r = await sql`
    SELECT user_message as question, COUNT(*)::int as frequency
    FROM chatbot_messages
    WHERE chatbot_id = ${chatbotId} AND LENGTH(user_message) > 5
    GROUP BY user_message ORDER BY frequency DESC LIMIT ${limit}
  `
  return r.rows as any
}

// Admins and stats multiplier (used by admin routes)
export async function getChatbotAdminUsers(chatbotId: number) {
  const r = await sql`
    SELECT id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
    FROM chatbot_admin_users
    WHERE chatbot_id = ${chatbotId}
    ORDER BY created_at DESC
  `
  return r.rows
}

export async function createAdminUser(adminUser: Omit<any, "id" | "created_at" | "updated_at">) {
  const r = await sql`
    INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
    VALUES (${adminUser.chatbot_id}, ${adminUser.username}, ${adminUser.password_hash}, ${adminUser.full_name}, ${adminUser.email}, ${adminUser.is_active})
    RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
  `
  return r.rows[0]
}

export async function updateAdminUser(id: number, updates: Partial<any>) {
  const r = await sql`
    UPDATE chatbot_admin_users
    SET
      username = COALESCE(${updates.username}, username),
      password_hash = COALESCE(${updates.password_hash}, password_hash),
      full_name = COALESCE(${updates.full_name}, full_name),
      email = COALESCE(${updates.email}, email),
      is_active = COALESCE(${updates.is_active}, is_active),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, chatbot_id, username, full_name, email, is_active, last_login, created_at, updated_at
  `
  return r.rows[0] || null
}

export async function deleteAdminUser(id: number): Promise<boolean> {
  await sql`DELETE FROM chatbot_admin_users WHERE id = ${id}`
  return true
}

export async function getAdminUserByUsername(chatbotId: number, username: string) {
  const r = await sql`
    SELECT * FROM chatbot_admin_users
    WHERE chatbot_id = ${chatbotId} AND username = ${username} AND is_active = true
  `
  return r.rows[0] || null
}

export async function updateAdminUserLastLogin(id: number) {
  await sql`UPDATE chatbot_admin_users SET last_login = NOW() WHERE id = ${id}`
}

export async function updateStatsMultiplier(chatbotId: number, multiplier: number): Promise<boolean> {
  await sql`UPDATE chatbots SET stats_multiplier = ${multiplier} WHERE id = ${chatbotId}`
  return true
}

export async function getStatsMultiplier(chatbotId: number): Promise<number> {
  const r = await sql`SELECT COALESCE(stats_multiplier, 1.0) as multiplier FROM chatbots WHERE id = ${chatbotId}`
  return Number(r.rows?.[0]?.multiplier ?? 1.0)
}

export async function getFAQsByChatbotId(chatbotId: number) {
  const r = await sql`SELECT * FROM chatbot_faqs WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
  return r.rows
}

export async function getProductsByChatbotId(chatbotId: number) {
  const r = await sql`SELECT * FROM chatbot_products WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
  return r.rows
}
