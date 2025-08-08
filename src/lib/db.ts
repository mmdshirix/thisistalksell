/**
* PostgreSQL helper powered by 'pg' (Node Postgres), not Neon.
* - Safe at import-time (no connection on import).
* - Works with DATABASE_URL or PG* discrete vars.
* - Provides sql tagged-template + helpers and idempotent initializer.
*
* If your provider requires TLS, append ?sslmode=require to the URL,
* or set PGSSLMODE=require.
*/

import { Pool, type PoolConfig, type QueryResult } from "pg"

// ------------------------- Connection Resolution -------------------------

const DB_ENV_KEYS = [
  "POSTGRES_URL",
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "DATABASE_URL_UNPOOLED",
] as const

function pickConnectionString(): { url?: string; usedEnv?: string } {
  for (const key of DB_ENV_KEYS) {
    const val = process.env[key]
    if (val && typeof val === "string" && val.trim().length > 0) {
      return { url: val.trim(), usedEnv: key }
    }
  }
  // Compose from PG* vars if present
  const host = process.env.PGHOST || process.env.POSTGRES_HOST || process.env.PGHOST_UNPOOLED
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
  return { url: undefined, usedEnv: undefined }
}

function shouldEnableSSL(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    const mode = u.searchParams.get("sslmode")
    if (mode && mode.toLowerCase() === "require") return true
    if (process.env.PGSSLMODE && process.env.PGSSLMODE.toLowerCase() === "require") return true
    return false
  } catch {
    return false
  }
}

// ------------------------- Pool Singleton -------------------------

let pool: Pool | null = null
let usedEnvKey: string | undefined

function getPool(): Pool {
  if (pool) return pool
  const { url, usedEnv } = pickConnectionString()
  usedEnvKey = usedEnv

  if (!url) {
    // Create an ended pool; queries will throw a helpful error in runQuery.
    pool = new Pool({} as PoolConfig)
    void pool.end()
    return pool
  }

  const cfg: PoolConfig = {
    connectionString: url,
    ssl: shouldEnableSSL(url) ? { rejectUnauthorized: false } : undefined,
    max: process.env.PGPOOL_MAX ? Number(process.env.PGPOOL_MAX) : 10,
    idleTimeoutMillis: process.env.PG_IDLE_TIMEOUT ? Number(process.env.PG_IDLE_TIMEOUT) : 30000,
    connectionTimeoutMillis: process.env.PG_CONNECT_TIMEOUT ? Number(process.env.PG_CONNECT_TIMEOUT) : 10000,
  }
  pool = new Pool(cfg)
  return pool
}

function paramQueryFromTemplate(strings: TemplateStringsArray, values: any[]) {
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
      "Database connection string is missing at runtime. Set one of: POSTGRES_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL, DATABASE_URL_UNPOOLED, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE."
    )
  }
  const p = getPool()
  return p.query(text, values)
}

// ------------------------- Public API -------------------------

export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<any>> {
  const { text, values: params } = paramQueryFromTemplate(strings, values)
  return runQuery(text, params)
}

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

// ------------------------- Health & Init -------------------------

export async function testDatabaseConnection(): Promise<{ ok: boolean; usingEnvVar?: string; error?: string }> {
  try {
    const r = await runQuery("SELECT 1 as ok", [])
    return { ok: r.rows[0]?.ok === 1, usingEnvVar: usedEnvKey }
  } catch (e: any) {
    return { ok: false, usingEnvVar: usedEnvKey, error: String(e?.message || e) }
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

// ------------------------- High-Level Helpers -------------------------

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

export async function createChatbot(data: { name: string }) {
  const r = await sql`
    INSERT INTO chatbots (
      name, created_at, updated_at
    ) VALUES (
      ${data.name.trim()}, NOW(), NOW()
    )
    RETURNING *
  `
  return r.rows[0]
}
