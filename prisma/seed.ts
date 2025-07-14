import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create sample chatbot
  const chatbot = await prisma.chatbot.upsert({
    where: { id: "sample-chatbot-id" },
    update: {},
    create: {
      id: "sample-chatbot-id",
      name: "فروشگاه نمونه",
      description: "چت‌بات نمونه برای فروشگاه آنلاین",
      website_url: "https://example.com",
      business_type: "فروشگاه آنلاین",
      primary_color: "#3B82F6",
      secondary_color: "#1E40AF",
      font_family: "Inter",
      welcome_message: "سلام! به فروشگاه ما خوش آمدید. چطور می‌تونم کمکتون کنم؟",
      placeholder_text: "پیام خود را بنویسید...",
      position: "bottom-right",
      size: "medium",
      is_active: true,
      stats_multiplier: 1,
    },
  })

  console.log("✅ Created chatbot:", chatbot.name)

  // Create sample FAQs
  const faqs = [
    {
      question: "ساعات کاری شما چیست؟",
      answer: "ما از شنبه تا پنج‌شنبه از ساعت 9 صبح تا 6 عصر در خدمت شما هستیم.",
      category: "عمومی",
    },
    {
      question: "چگونه سفارش دهم؟",
      answer: "شما می‌توانید از طریق وب‌سایت ما سفارش خود را ثبت کنید یا با شماره تماس ما تماس بگیرید.",
      category: "سفارش",
    },
    {
      question: "هزینه ارسال چقدر است؟",
      answer: "هزینه ارسال بسته به وزن و مقصد متفاوت است. برای سفارش‌های بالای 500 هزار تومان، ارسال رایگان است.",
      category: "ارسال",
    },
  ]

  for (const [index, faq] of faqs.entries()) {
    await prisma.fAQ.upsert({
      where: { id: `faq-${index + 1}` },
      update: {},
      create: {
        id: `faq-${index + 1}`,
        chatbot_id: chatbot.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        is_active: true,
        order_index: index,
      },
    })
  }

  console.log("✅ Created FAQs")

  // Create sample products
  const products = [
    {
      name: "لپ‌تاپ گیمینگ",
      description: "لپ‌تاپ قدرتمند برای بازی و کار",
      price: 25000000,
      category: "کامپیوتر",
      image_url: "/placeholder.svg?height=200&width=200&text=لپ‌تاپ",
    },
    {
      name: "گوشی هوشمند",
      description: "گوشی هوشمند با امکانات پیشرفته",
      price: 15000000,
      category: "موبایل",
      image_url: "/placeholder.svg?height=200&width=200&text=گوشی",
    },
    {
      name: "هدفون بی‌سیم",
      description: "هدفون با کیفیت صدای عالی",
      price: 2000000,
      category: "صوتی",
      image_url: "/placeholder.svg?height=200&width=200&text=هدفون",
    },
  ]

  for (const [index, product] of products.entries()) {
    await prisma.product.upsert({
      where: { id: `product-${index + 1}` },
      update: {},
      create: {
        id: `product-${index + 1}`,
        chatbot_id: chatbot.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        is_active: true,
        order_index: index,
      },
    })
  }

  console.log("✅ Created products")

  // Create sample user
  const user = await prisma.user.upsert({
    where: { phone: "09123456789" },
    update: {},
    create: {
      phone: "09123456789",
      email: "user@example.com",
      name: "کاربر نمونه",
    },
  })

  console.log("✅ Created user")

  // Create sample tickets
  const tickets = [
    {
      title: "مشکل در پرداخت",
      description: "سلام، من نمی‌تونم پرداخت رو انجام بدم. لطفاً کمک کنید.",
      status: "OPEN",
      priority: "high",
    },
    {
      title: "سوال درباره محصول",
      description: "آیا این محصول گارانتی داره؟",
      status: "RESOLVED",
      priority: "medium",
    },
  ]

  for (const [index, ticket] of tickets.entries()) {
    await prisma.ticket.upsert({
      where: { id: `ticket-${index + 1}` },
      update: {},
      create: {
        id: `ticket-${index + 1}`,
        chatbot_id: chatbot.id,
        user_id: user.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status as any,
        priority: ticket.priority,
      },
    })
  }

  console.log("✅ Created tickets")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.adminUser.upsert({
    where: {
      chatbot_id_username: {
        chatbot_id: chatbot.id,
        username: "admin",
      },
    },
    update: {},
    create: {
      chatbot_id: chatbot.id,
      username: "admin",
      password: hashedPassword,
      role: "admin",
      is_active: true,
    },
  })

  console.log("✅ Created admin user")

  // Create sample messages
  const messages = [
    { content: "سلام", is_user: true },
    { content: "سلام! به فروشگاه ما خوش آمدید. چطور می‌تونم کمکتون کنم؟", is_user: false },
    { content: "قیمت لپ‌تاپ چقدره؟", is_user: true },
    { content: "لپ‌تاپ گیمینگ ما 25 میلیون تومان قیمت داره. آیا اطلاعات بیشتری می‌خواید؟", is_user: false },
  ]

  for (const [index, message] of messages.entries()) {
    await prisma.message.upsert({
      where: { id: `message-${index + 1}` },
      update: {},
      create: {
        id: `message-${index + 1}`,
        chatbot_id: chatbot.id,
        user_id: user.id,
        content: message.content,
        is_user: message.is_user,
        session_id: "sample-session",
      },
    })
  }

  console.log("✅ Created messages")
  console.log("🎉 Database seed completed successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
