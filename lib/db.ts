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

const DB_ENV_KEYS = [
  "POSTGRES_URL",
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "DATABASE_URL_UNPOOLED",
] as const

type DbEnvKey = (typeof DB_ENV_KEYS)[number]

function pickConnectionString(): { url?: string; usedEnv?: string } {
  for (const key of DB_ENV_KEYS) {
    const val = process.env[key]
    if (val && typeof val === "string" && val.trim().length > 0) {
      return { url: val.trim(), usedEnv: key }
    }
  }
  // Compose from discrete PG* vars if present
  const host = process.env.PGHOST
  const user = process.env.PGUSER
  const password = process.env.PGPASSWORD
  const database = process.env.PGDATABASE
  const port = process.env.PGPORT || "5432"
  if (host && user && database) {
    const pass = password ? `:${encodeURIComponent(password)}` : ""
    const url = `postgresql://${encodeURIComponent(user)}${pass}@${host}:${port}/${encodeURIComponent(database)}`
    return { url, usedEnv: "PGHOST/PGUSER/PGPASSWORD/PGDATABASE" }
  }
  return { url: undefined, usedEnv: undefined }
}

let pool: Pool | null = null
let usedEnvKey: string | undefined

function shouldEnableSSL(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    const mode = u.searchParams.get("sslmode")
    if (mode && mode.toLowerCase() === "require") return true
    // For common cloud DBs, you might require SSL. For your Liara internal host you provided, likely not required.
    // We default to false unless explicitly requested by sslmode=require or PGSSLMODE=require.
    if (process.env.PGSSLMODE && process.env.PGSSLMODE.toLowerCase() === "require") return true
    return false
  } catch {
    return false
  }
}

function getPool(): Pool {
  if (pool) return pool
  const { url, usedEnv } = pickConnectionString()
  usedEnvKey = usedEnv

  // Do NOT throw at import-time/build-time. Only create pool if URL is set;
  // otherwise we keep a lazy error for when queries are executed.
  if (!url) {
    // Create a dummy pool-like object that throws on query to avoid build crashes.
    // However for TypeScript typing we still build a real Pool when first query is attempted and env is present.
    // To keep runtime behavior clear, we throw when a query is attempted without URL.
    const cfg: PoolConfig = {} as any
    pool = new Pool(cfg)
    // We will immediately end this pool to avoid zombie connections.
    // But keep pool non-null to prevent multiple initializations.
    // Subsequent query attempts will throw a clear error below.
    void pool.end()
    return pool
  }

  const enableSSL = shouldEnableSSL(url)
  const cfg: PoolConfig = {
    connectionString: url,
    ssl: enableSSL ? { rejectUnauthorized: false } : undefined,
    // Optional tuning via envs
    max: process.env.PGPOOL_MAX ? Number(process.env.PGPOOL_MAX) : 10,
    idleTimeoutMillis: process.env.PG_IDLE_TIMEOUT ? Number(process.env.PG_IDLE_TIMEOUT) : 30000,
    connectionTimeoutMillis: process.env.PG_CONNECT_TIMEOUT ? Number(process.env.PG_CONNECT_TIMEOUT) : 10000,
  }
  pool = new Pool(cfg)
  return pool
}

// Simple tagged template to build parameterized queries: sql`select * from t where id = ${id}`
async function runQuery(text: string, values: any[] = []) {
  const { url } = pickConnectionString()
  if (!url) {
    throw new Error(
      "Database connection string is missing at runtime. Set one of: POSTGRES_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL, DATABASE_URL_UNPOOLED, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE."
    )
  }
  const p = getPool()
  return p.query(text, values)
}

export async function testDatabaseConnection(): Promise<{ ok: boolean; usingEnvVar?: string; error?: string }> {
  try {
    const res = await runQuery("select 1 as ok", [])
    return { ok: res.rows[0]?.ok === 1, usingEnvVar: usedEnvKey }
  } catch (e: any) {
    return { ok: false, usingEnvVar: usedEnvKey, error: String(e?.message || e) }
  }
}

// Tagged template
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<any>> {
  let text = ""
  for (let i = 0; i < strings.length - 1; i++) {
    text += strings[i] + `$${i + 1}`
  }
  text += strings[strings.length - 1]
  return runQuery(text, values)
}

// Some code imports getSql() and then uses it as a tag. We return a function-compatible object.
export async function getSql() {
  const tag = async (strings: TemplateStringsArray, ...values: any[]) => sql(strings, ...values)
  ;(tag as any).query = (text: string, params?: any[]) => runQuery(text, params)
  return tag
}

// Minimal helpers expected by some routes. These use conservative table names.
// They are safe no-ops if tables do not exist yet (they will throw with a clear DB error).
export async function getAllChatbots() {
  const { rows } = await sql`select * from chatbots order by id desc`
  return rows
}

export async function createChatbot(data: { name: string; description?: string | null }) {
  const { rows } =
    await sql`insert into chatbots (name, description) values (${data.name}, ${data.description ?? null}) returning *`
  return rows[0]
}

export async function getChatbotById(id: string | number) {
  const { rows } = await sql`select * from chatbots where id = ${id} limit 1`
  return rows[0] ?? null
}

export async function getChatbotFAQs(chatbotId: string | number) {
  const { rows } = await sql`select * from faqs where chatbot_id = ${chatbotId} order by id asc`
  return rows
}

export async function getChatbotProducts(chatbotId: string | number) {
  const { rows } = await sql`select * from products where chatbot_id = ${chatbotId} order by id asc`
  return rows
}

export async function getChatbotOptions(chatbotId: string | number) {
  // Adjust table name if your schema differs (e.g., chatbot_options or options)
  const { rows } = await sql`select * from chatbot_options where chatbot_id = ${chatbotId} limit 1`
  return rows[0] ?? null
}

// ------------------------- High-Level Query Helpers -------------------------

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
export async function syncChatbotFAQs(chatbotId: number, faqs: any[]) {
  await sql`DELETE FROM faqs WHERE chatbot_id = ${chatbotId}`
  const saved: any[] = []
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i]
    const r = await sql`
      INSERT INTO faqs (chatbot_id, question, answer, emoji, position)
      VALUES (${chatbotId}, ${faq.question}, ${faq.answer}, ${faq.emoji || "❓"}, ${i})
      RETURNING *
    `
    if (r.rows[0]) saved.push(r.rows[0])
  }
  return saved
}

// Products
export async function syncChatbotProducts(chatbotId: number, products: any[]) {
  await sql`DELETE FROM products WHERE chatbot_id = ${chatbotId}`
  const saved: any[] = []
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const r = await sql`
      INSERT INTO products (
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
  const r = await sql`SELECT * FROM faqs WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
  return r.rows
}

export async function getProductsByChatbotId(chatbotId: number) {
  const r = await sql`SELECT * FROM products WHERE chatbot_id = ${chatbotId} ORDER BY id ASC`
  return r.rows
}
