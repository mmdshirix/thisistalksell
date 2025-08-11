/**
 * PostgreSQL helper powered by 'pg' (Node Postgres), not Neon/fetch.
 * - Safe at import-time (no connection on import).
 * - Works with DATABASE_URL or PG* discrete vars.
 * - Provides sql tagged-template + helpers and idempotent initializer.
 *
 * If your provider requires TLS, append ?sslmode=require to the URL,
 * or set PGSSLMODE=require.
 */

import { Pool, type PoolConfig, type QueryResult } from "pg"
import bcrypt from "bcryptjs"

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
  // First check for explicit DATABASE_URL (Liara standard)
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl && typeof databaseUrl === "string" && databaseUrl.trim().length > 0) {
    return { url: databaseUrl.trim(), usedEnv: "DATABASE_URL" }
  }

  // Then check other standard environment variables
  for (const key of DB_ENV_KEYS.slice(1)) {
    // Skip DATABASE_URL as we checked it first
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

async function runQuery<T = any>(text: string, values: any[] = []): Promise<QueryResult<T>> {
  const { url } = pickConnectionString()
  if (!url) {
    throw new Error(
      "Database connection string is missing at runtime. Set one of: POSTGRES_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_URL_NO_SSL, DATABASE_URL_UNPOOLED, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE.",
    )
  }
  const p = getPool()
  return p.query<T>(text, values)
}

// ------------------------- Public API -------------------------

export async function sql<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<QueryResult<T>> {
  const { text, values: params } = paramQueryFromTemplate(strings, values)
  return runQuery<T>(text, params)
}

export function getSql() {
  const tag = async <T = any>(strings: TemplateStringsArray, ...values: any[]) => sql<T>(strings, ...values)
  ;(tag as any).query = <T = any>(text: string, params?: any[]) => runQuery<T>(text, params)
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

export async function testDatabaseConnection(): Promise<{ ok: boolean; usingEnvVar?: string; error?: string | null }> {
  try {
    const r = await runQuery("SELECT 1 as ok", [])
    return { ok: r.rows[0]?.ok === 1, usingEnvVar: getActiveDbEnvVar() ?? undefined, error: null }
  } catch (e: any) {
    return { ok: false, usingEnvVar: getActiveDbEnvVar() ?? undefined, error: String(e?.message || e) }
  }
}

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Create chatbots table
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

    // Create related tables
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
        username VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chatbot_id, username)
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

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_messages_chatbot_id ON chatbot_messages(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_messages_timestamp ON chatbot_messages(timestamp)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_faqs_chatbot_id ON chatbot_faqs(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_products_chatbot_id ON chatbot_products(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chatbot_options_chatbot_id ON chatbot_options(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_chatbot_id ON tickets(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_ticket_responses_ticket_id ON ticket_responses(ticket_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_chatbot_id ON chatbot_admin_users(chatbot_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON chatbot_admin_sessions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON chatbot_admin_sessions(session_token)`

    return { success: true, message: "Database initialized successfully with all tables and indexes" }
  } catch (err: any) {
    return { success: false, message: `Database initialization error: ${err?.message ?? String(err)}` }
  }
}

// ------------------------- High-Level Helpers -------------------------

export type ChatbotRow = {
  id: number
  name: string
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
  stats_multiplier: string | null // NUMERIC comes back as string
}

export async function getChatbots() {
  const r = await sql<ChatbotRow>`
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

const CHATBOT_ALLOWED_COLUMNS = [
  "name",
  "primary_color",
  "text_color",
  "background_color",
  "chat_icon",
  "position",
  "margin_x",
  "margin_y",
  "deepseek_api_key",
  "welcome_message",
  "navigation_message",
  "knowledge_base_text",
  "knowledge_base_url",
  "store_url",
  "ai_url",
  "stats_multiplier",
] as const

type ChatbotInsert = Partial<Record<(typeof CHATBOT_ALLOWED_COLUMNS)[number], any>> & { name: string }

export async function createChatbot(data: ChatbotInsert) {
  const name = (data.name ?? "").toString().trim()
  if (!name) {
    throw new Error("name is required")
  }

  // Build dynamic INSERT with only allowed keys that are present
  const keys = CHATBOT_ALLOWED_COLUMNS.filter((k) => data[k] !== undefined)

  // Ensure "name" is included as first column
  if (!keys.includes("name")) keys.unshift("name")

  const values = keys.map((k) => (k === "name" ? name : (data as any)[k]))

  // Add timestamps
  const colsSql = keys
    .concat(["created_at", "updated_at"])
    .map((k) => `"${k}"`)
    .join(", ")
  const placeholders = values
    .map((_, i) => `$${i + 1}`)
    .concat(["NOW()", "NOW()"])
    .join(", ")

  const text = `INSERT INTO chatbots (${colsSql}) VALUES (${placeholders}) RETURNING *`

  const r = await getSql().query<ChatbotRow>(text, values)
  return r.rows[0]
}

// ------------------------- Complete Sample Chatbot Creation -------------------------

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

    // Create the main chatbot with comprehensive settings
    const chatbot = await createChatbot({
      name: "نمونه چت‌بات پشتیبانی",
      primary_color: "#14b8a6",
      text_color: "#ffffff",
      background_color: "#f3f4f6",
      chat_icon: "💬",
      position: "bottom-right",
      margin_x: 20,
      margin_y: 20,
      welcome_message: "سلام! به چت‌بات پشتیبانی خوش آمدید. چطور می‌توانم به شما کمک کنم؟",
      navigation_message: "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:",
      knowledge_base_text:
        "ما یک شرکت فناوری هستیم که خدمات مختلفی ارائه می‌دهیم. ساعات کاری ما از شنبه تا چهارشنبه 9 صبح تا 6 عصر است. تیم پشتیبانی ما آماده پاسخگویی به سوالات شما در زمینه محصولات، خدمات، فروش و پشتیبانی فنی است.",
      stats_multiplier: 1.0,
    })

    // Create comprehensive FAQs
    const faqs = [
      {
        question: "ساعات کاری شما چیست؟",
        answer:
          "ما از شنبه تا چهارشنبه از ساعت 9 صبح تا 6 عصر در خدمت شما هستیم. در روزهای تعطیل نیز پشتیبانی آنلاین فعال است.",
        emoji: "🕒",
        position: 1,
      },
      {
        question: "چگونه می‌توانم با پشتیبانی تماس بگیرم؟",
        answer:
          "می‌توانید از طریق این چت، ایمیل support@company.com، تلفن 021-12345678 یا فرم تماس در وب‌سایت با ما تماس بگیرید.",
        emoji: "📞",
        position: 2,
      },
      {
        question: "سیاست بازگشت کالا چیست؟",
        answer:
          "شما می‌توانید تا 30 روز پس از خرید، کالای خود را در صورت عدم استفاده و داشتن بسته‌بندی اصلی بازگردانید. هزینه ارسال بازگشت بر عهده مشتری است.",
        emoji: "↩️",
        position: 3,
      },
      {
        question: "چگونه می‌توانم سفارش خود را پیگیری کنم؟",
        answer:
          "با وارد کردن شماره سفارش خود در بخش پیگیری سفارش، می‌توانید وضعیت سفارش خود را مشاهده کنید. همچنین پیامک اطلاع‌رسانی نیز ارسال می‌شود.",
        emoji: "📦",
        position: 4,
      },
      {
        question: "روش‌های پرداخت چیست؟",
        answer: "ما پرداخت آنلاین، کارت به کارت، واریز به حساب و پرداخت در محل را پذیرش می‌کنیم.",
        emoji: "💳",
        position: 5,
      },
      {
        question: "آیا تخفیف دانشجویی دارید؟",
        answer: "بله، دانشجویان با ارائه کارت دانشجویی معتبر می‌توانند از 20% تخفیف بهره‌مند شوند.",
        emoji: "🎓",
        position: 6,
      },
    ]

    for (const faq of faqs) {
      await sql`
        INSERT INTO chatbot_faqs (chatbot_id, question, answer, emoji, position)
        VALUES (${chatbot.id}, ${faq.question}, ${faq.answer}, ${faq.emoji}, ${faq.position})
      `
    }

    // Create comprehensive product catalog
    const products = [
      {
        name: "پلن پشتیبانی طلایی",
        description: "پشتیبانی 24/7 با مدیر اختصاصی، پاسخگویی فوری، مشاوره رایگان و گارانتی کیفیت",
        price: 299000,
        button_text: "خرید فوری",
        secondary_text: "جزئیات کامل",
        position: 1,
      },
      {
        name: "پلن پشتیبانی نقره‌ای",
        description: "پشتیبانی در ساعات اداری با چت و ایمیل، راهنمایی فنی و پیگیری سفارشات",
        price: 149000,
        button_text: "انتخاب پلن",
        secondary_text: "مقایسه ویژگی‌ها",
        position: 2,
      },
      {
        name: "راه‌حل سازمانی",
        description: "بسته کامل سازمانی با یکپارچه‌سازی سفارشی، آموزش تیم و پشتیبانی اختصاصی",
        price: 999000,
        button_text: "درخواست مشاوره",
        secondary_text: "تماس با فروش",
        position: 3,
      },
      {
        name: "پکیج استارتاپی",
        description: "ویژه کسب‌وکارهای نوپا با امکانات پایه و قیمت مناسب برای شروع",
        price: 79000,
        button_text: "شروع کنید",
        secondary_text: "مناسب برای چه کسانی؟",
        position: 4,
      },
    ]

    for (const product of products) {
      await sql`
        INSERT INTO chatbot_products (chatbot_id, name, description, price, button_text, secondary_text, position)
        VALUES (${chatbot.id}, ${product.name}, ${product.description}, ${product.price}, ${product.button_text}, ${product.secondary_text}, ${product.position})
      `
    }

    // Create comprehensive quick options
    const options = [
      { label: "بررسی وضعیت سفارش", emoji: "📦", position: 1 },
      { label: "سوالات مالی و پرداخت", emoji: "💰", position: 2 },
      { label: "پشتیبانی فنی", emoji: "🔧", position: 3 },
      { label: "ثبت شکایت", emoji: "📝", position: 4 },
      { label: "درخواست مشاوره", emoji: "💡", position: 5 },
      { label: "اطلاعات محصولات", emoji: "🛍️", position: 6 },
    ]

    for (const option of options) {
      await sql`
        INSERT INTO chatbot_options (chatbot_id, label, emoji, position)
        VALUES (${chatbot.id}, ${option.label}, ${option.emoji}, ${option.position})
      `
    }

    // Create admin user with secure password
    const passwordHash = await bcrypt.hash("admin123", 12)
    await sql`
      INSERT INTO chatbot_admin_users (chatbot_id, username, password_hash, full_name, email, is_active)
      VALUES (${chatbot.id}, 'admin', ${passwordHash}, 'مدیر سیستم', 'admin@company.com', true)
      ON CONFLICT (chatbot_id, username) DO NOTHING
    `

    // Create realistic sample messages for analytics
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
      {
        user_message: "آیا تخفیف دانشجویی دارید؟",
        bot_response: "بله، دانشجویان عزیز با ارائه کارت دانشجویی معتبر می‌توانند از 20% تخفیف بهره‌مند شوند.",
        user_ip: "192.168.1.102",
      },
      {
        user_message: "نحوه پرداخت چیه؟",
        bot_response: "ما روش‌های مختلف پرداخت شامل پرداخت آنلاین، کارت به کارت و پرداخت در محل را پذیرش می‌کنیم.",
        user_ip: "192.168.1.103",
      },
      {
        user_message: "ساعات کاری‌تون چیه؟",
        bot_response: "ما از شنبه تا چهارشنبه از ساعت 9 صبح تا 6 عصر در خدمت شما هستیم.",
        user_ip: "192.168.1.104",
      },
    ]

    for (const msg of sampleMessages) {
      await sql`
        INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent)
        VALUES (${chatbot.id}, ${msg.user_message}, ${msg.bot_response}, ${msg.user_ip}, 'Mozilla/5.0 (Sample Browser)')
      `
    }

    // Create a sample ticket for testing
    await sql`
      INSERT INTO tickets (chatbot_id, name, email, phone, subject, message, status, priority, user_ip)
      VALUES (
        ${chatbot.id}, 
        'علی احمدی', 
        'ali@example.com', 
        '09123456789',
        'مشکل در پرداخت آنلاین',
        'سلام، هنگام پرداخت آنلاین با خطا مواجه می‌شوم. لطفاً راهنمایی کنید.',
        'open',
        'high',
        '192.168.1.200'
      )
    `

    return {
      success: true,
      message: "Complete sample chatbot created successfully with comprehensive data",
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
