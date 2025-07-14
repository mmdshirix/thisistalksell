import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

const prisma = new PrismaClient()
const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log("🌱 Starting database seed...")

  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS chatbots (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        description TEXT,
        website_url TEXT,
        business_type TEXT,
        primary_color TEXT DEFAULT '#3B82F6',
        secondary_color TEXT DEFAULT '#1E40AF',
        font_family TEXT DEFAULT 'Inter',
        welcome_message TEXT DEFAULT 'سلام! چطور می‌تونم کمکتون کنم؟',
        placeholder_text TEXT DEFAULT 'پیام خود را بنویسید...',
        position TEXT DEFAULT 'bottom-right',
        size TEXT DEFAULT 'medium',
        is_active BOOLEAN DEFAULT true,
        stats_multiplier INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS faqs (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        chatbot_id TEXT NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        chatbot_id TEXT NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL,
        image_url TEXT,
        category TEXT,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        chatbot_id TEXT NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id),
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL,
        session_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
    `

    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        chatbot_id TEXT NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status ticket_status DEFAULT 'OPEN',
        priority TEXT DEFAULT 'medium',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS ticket_responses (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        chatbot_id TEXT NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(chatbot_id, username)
      )
    `

    console.log("✅ Tables created successfully")

    // Insert sample data
    const sampleChatbot = await sql`
      INSERT INTO chatbots (
        name, 
        description, 
        website_url, 
        business_type,
        welcome_message,
        placeholder_text
      ) VALUES (
        'چت‌بات نمونه',
        'یک چت‌بات نمونه برای تست عملکرد سیستم',
        'https://example.com',
        'فروشگاه آنلاین',
        'سلام! به فروشگاه ما خوش آمدید. چطور می‌تونم کمکتون کنم؟',
        'سوال خود را بپرسید...'
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `

    if (sampleChatbot.length > 0) {
      const chatbotId = sampleChatbot[0].id

      // Insert sample FAQs
      await sql`
        INSERT INTO faqs (chatbot_id, question, answer, order_index) VALUES
        (${chatbotId}, 'ساعات کاری شما چیست؟', 'ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.', 1),
        (${chatbotId}, 'چگونه سفارش دهم؟', 'شما می‌توانید از طریق وب‌سایت ما یا تماس با شماره پشتیبانی سفارش دهید.', 2),
        (${chatbotId}, 'هزینه ارسال چقدر است؟', 'هزینه ارسال بسته به منطقه و وزن محصول متفاوت است. برای سفارش‌های بالای ۵۰۰ هزار تومان ارسال رایگان است.', 3),
        (${chatbotId}, 'آیا امکان مرجوعی کالا وجود دارد؟', 'بله، تا ۷ روز پس از دریافت کالا امکان مرجوعی وجود دارد.', 4)
        ON CONFLICT DO NOTHING
      `

      // Insert sample products
      await sql`
        INSERT INTO products (chatbot_id, name, description, price, order_index) VALUES
        (${chatbotId}, 'گوشی هوشمند', 'گوشی هوشمند با کیفیت بالا و قیمت مناسب', 15000000, 1),
        (${chatbotId}, 'لپ‌تاپ گیمینگ', 'لپ‌تاپ قدرتمند برای بازی و کار', 45000000, 2),
        (${chatbotId}, 'هدفون بی‌سیم', 'هدفون با کیفیت صدای عالی', 2500000, 3),
        (${chatbotId}, 'ساعت هوشمند', 'ساعت هوشمند با امکانات متنوع', 8000000, 4)
        ON CONFLICT DO NOTHING
      `

      // Insert sample user
      const sampleUser = await sql`
        INSERT INTO users (name, phone, email) VALUES
        ('کاربر نمونه', '09123456789', 'user@example.com')
        ON CONFLICT DO NOTHING
        RETURNING id
      `

      if (sampleUser.length > 0) {
        const userId = sampleUser[0].id

        // Insert sample messages
        await sql`
          INSERT INTO messages (chatbot_id, user_id, content, is_user) VALUES
          (${chatbotId}, ${userId}, 'سلام', true),
          (${chatbotId}, null, 'سلام! به فروشگاه ما خوش آمدید. چطور می‌تونم کمکتون کنم؟', false),
          (${chatbotId}, ${userId}, 'قیمت گوشی چقدر است؟', true),
          (${chatbotId}, null, 'قیمت گوشی هوشمند ما ۱۵ میلیون تومان است. آیا اطلاعات بیشتری می‌خواهید؟', false)
          ON CONFLICT DO NOTHING
        `

        // Insert sample ticket
        const sampleTicket = await sql`
          INSERT INTO tickets (chatbot_id, user_id, title, description, priority) VALUES
          (${chatbotId}, ${userId}, 'مشکل در پرداخت', 'هنگام پرداخت با خطا مواجه شدم', 'high')
          ON CONFLICT DO NOTHING
          RETURNING id
        `

        if (sampleTicket.length > 0) {
          const ticketId = sampleTicket[0].id

          // Insert sample ticket responses
          await sql`
            INSERT INTO ticket_responses (ticket_id, content, is_admin) VALUES
            (${ticketId}, 'مشکل من در پرداخت حل نشده', false),
            (${ticketId}, 'با عرض پوزش، لطفاً شماره سفارش خود را ارسال کنید تا بررسی کنیم.', true)
            ON CONFLICT DO NOTHING
          `
        }
      }

      // Insert sample admin user
      await sql`
        INSERT INTO admin_users (chatbot_id, username, password, role) VALUES
        (${chatbotId}, 'admin', 'admin123', 'admin')
        ON CONFLICT DO NOTHING
      `

      console.log("✅ Sample data inserted successfully")
      console.log(`📝 Sample chatbot ID: ${chatbotId}`)
    }

    console.log("🎉 Database seed completed successfully!")
  } catch (error) {
    console.error("❌ Error during seed:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
