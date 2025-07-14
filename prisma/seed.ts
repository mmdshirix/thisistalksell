import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      name: "کاربر نمونه ۱",
      phone: "09123456789",
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      name: "کاربر نمونه ۲",
      phone: "09987654321",
    },
  })

  // Create sample chatbot
  const chatbot = await prisma.chatbot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "چت‌بات فروشگاهی",
      primaryColor: "#2563EB",
      textColor: "#FFFFFF",
      backgroundColor: "#F3F4F6",
      chatIcon: "🤖",
      position: "bottom-right",
      marginX: 20,
      marginY: 20,
      welcomeMessage: "سلام! به فروشگاه ما خوش آمدید. چطور می‌توانم کمکتان کنم؟",
      navigationMessage: "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:",
      knowledgeBaseText: "این یک فروشگاه آنلاین است که انواع محصولات را ارائه می‌دهد.",
      statsMultiplier: 1.0,
      enableProductSuggestions: true,
      enableNextSuggestions: true,
    },
  })

  // Create sample FAQs
  const faqs = [
    {
      chatbotId: chatbot.id,
      question: "ساعات کاری فروشگاه چیست؟",
      answer: "فروشگاه ما ۲۴ ساعته فعال است و می‌توانید هر زمان خرید کنید.",
      emoji: "🕐",
      position: 0,
    },
    {
      chatbotId: chatbot.id,
      question: "چگونه سفارش دهم؟",
      answer: "برای سفارش، محصول مورد نظر را انتخاب کرده و به سبد خرید اضافه کنید.",
      emoji: "🛒",
      position: 1,
    },
    {
      chatbotId: chatbot.id,
      question: "هزینه ارسال چقدر است؟",
      answer: "ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان رایگان است.",
      emoji: "🚚",
      position: 2,
    },
  ]

  for (const faq of faqs) {
    await prisma.chatbotFAQ.upsert({
      where: { id: faq.position + 1 },
      update: {},
      create: faq,
    })
  }

  // Create sample products
  const products = [
    {
      chatbotId: chatbot.id,
      name: "گوشی هوشمند",
      description: "گوشی هوشمند با کیفیت بالا و قیمت مناسب",
      price: 15000000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      buttonText: "خرید",
      secondaryText: "مشاهده جزئیات",
      productUrl: "/products/smartphone",
      position: 0,
    },
    {
      chatbotId: chatbot.id,
      name: "لپ‌تاپ",
      description: "لپ‌تاپ قدرتمند برای کار و بازی",
      price: 25000000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      buttonText: "خرید",
      secondaryText: "مشاهده جزئیات",
      productUrl: "/products/laptop",
      position: 1,
    },
    {
      chatbotId: chatbot.id,
      name: "هدفون",
      description: "هدفون بی‌سیم با کیفیت صدای عالی",
      price: 2000000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      buttonText: "خرید",
      secondaryText: "مشاهده جزئیات",
      productUrl: "/products/headphones",
      position: 2,
    },
  ]

  for (const product of products) {
    await prisma.chatbotProduct.upsert({
      where: { id: product.position + 1 },
      update: {},
      create: product,
    })
  }

  // Create sample options
  const options = [
    {
      chatbotId: chatbot.id,
      label: "مشاهده محصولات",
      emoji: "📱",
      position: 0,
    },
    {
      chatbotId: chatbot.id,
      label: "پیگیری سفارش",
      emoji: "📦",
      position: 1,
    },
    {
      chatbotId: chatbot.id,
      label: "پشتیبانی",
      emoji: "💬",
      position: 2,
    },
  ]

  for (const option of options) {
    await prisma.chatbotOption.upsert({
      where: { id: option.position + 1 },
      update: {},
      create: option,
    })
  }

  // Create sample messages
  const messages = [
    {
      chatbotId: chatbot.id,
      userId: user1.id,
      content: "سلام، می‌خواهم یک گوشی خریداری کنم",
      role: "user",
      userMessage: "سلام، می‌خواهم یک گوشی خریداری کنم",
      botResponse: "سلام! خوشحالم که می‌خواهید از ما خرید کنید. چه نوع گوشی‌ای دنبال هستید؟",
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      chatbotId: chatbot.id,
      userId: user2.id,
      content: "آیا ارسال رایگان دارید؟",
      role: "user",
      userMessage: "آیا ارسال رایگان دارید؟",
      botResponse: "بله، برای سفارش‌های بالای ۵۰۰ هزار تومان ارسال رایگان است.",
      userIp: "192.168.1.2",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    },
  ]

  for (const message of messages) {
    await prisma.message.create({
      data: message,
    })
  }

  // Create sample products in general products table
  const generalProducts = [
    {
      name: "گوشی Samsung Galaxy S23",
      description: "گوشی هوشمند پرچمدار سامسونگ با دوربین فوق‌العاده",
      price: 18000000,
      imageUrl: "/placeholder.svg?height=300&width=300",
      category: "موبایل",
      inStock: true,
    },
    {
      name: "لپ‌تاپ MacBook Pro",
      description: "لپ‌تاپ حرفه‌ای اپل برای کارهای سنگین",
      price: 45000000,
      imageUrl: "/placeholder.svg?height=300&width=300",
      category: "لپ‌تاپ",
      inStock: true,
    },
    {
      name: "هدفون Sony WH-1000XM4",
      description: "هدفون بی‌سیم با حذف نویز فعال",
      price: 8000000,
      imageUrl: "/placeholder.svg?height=300&width=300",
      category: "صوتی",
      inStock: false,
    },
  ]

  for (const product of generalProducts) {
    await prisma.product.create({
      data: product,
    })
  }

  // Create sample ticket
  const ticket = await prisma.ticket.create({
    data: {
      chatbotId: chatbot.id,
      userId: user1.id,
      name: "علی احمدی",
      email: "ali@example.com",
      phone: "09123456789",
      subject: "مشکل در پرداخت",
      message: "سلام، هنگام پرداخت با خطا مواجه شدم. لطفاً کمک کنید.",
      status: "OPEN",
      priority: "NORMAL",
      userIp: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  // Create sample ticket response
  await prisma.ticketResponse.create({
    data: {
      ticketId: ticket.id,
      message: "سلام آقای احمدی، تیم پشتیبانی در حال بررسی مشکل شما است.",
      isAdmin: true,
    },
  })

  // Create sample admin user
  await prisma.chatbotAdminUser.create({
    data: {
      chatbotId: chatbot.id,
      username: "admin",
      passwordHash: "$2b$10$example.hash.here", // In real app, use proper bcrypt hash
      fullName: "مدیر سیستم",
      email: "admin@example.com",
      isActive: true,
    },
  })

  console.log("✅ Database seeding completed successfully!")
  console.log(`Created:
  - ${faqs.length} FAQs
  - ${products.length} chatbot products
  - ${options.length} chatbot options
  - ${messages.length} messages
  - ${generalProducts.length} general products
  - 1 ticket with 1 response
  - 1 admin user
  - 2 users`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
