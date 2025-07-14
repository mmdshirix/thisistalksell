import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      phone: "+989123456789",
    },
  })

  console.log("✅ Created user:", user.email)

  // Create sample chatbot
  const chatbot = await prisma.chatbot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "نمونه چت‌بات",
      primaryColor: "#14b8a6",
      textColor: "#ffffff",
      backgroundColor: "#f3f4f6",
      chatIcon: "🤖",
      position: "bottom-right",
      marginX: 20,
      marginY: 20,
      welcomeMessage: "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigationMessage: "چه چیزی شما را به اینجا آورده است؟",
      knowledgeBaseText: "این یک چت‌بات نمونه است که می‌تواند به سوالات شما پاسخ دهد.",
      statsMultiplier: 1.0,
      enableProductSuggestions: true,
      enableNextSuggestions: true,
    },
  })

  console.log("✅ Created chatbot:", chatbot.name)

  // Create sample FAQs
  const faqs = [
    {
      question: "ساعات کاری شما چیست؟",
      answer: "ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.",
      emoji: "🕐",
      position: 0,
      chatbotId: chatbot.id,
    },
    {
      question: "چگونه می‌توانم سفارش دهم؟",
      answer: "شما می‌توانید از طریق وب‌سایت ما یا تماس تلفنی سفارش خود را ثبت کنید.",
      emoji: "🛒",
      position: 1,
      chatbotId: chatbot.id,
    },
    {
      question: "آیا ارسال رایگان دارید؟",
      answer: "برای سفارش‌های بالای ۵۰۰ هزار تومان، ارسال رایگان است.",
      emoji: "🚚",
      position: 2,
      chatbotId: chatbot.id,
    },
  ]

  for (const faq of faqs) {
    await prisma.chatbotFAQ.upsert({
      where: { id: faq.position + 1 },
      update: {},
      create: faq,
    })
  }

  console.log("✅ Created FAQs")

  // Create sample products
  const products = [
    {
      name: "محصول شماره ۱",
      description: "این یک محصول نمونه است",
      price: 100000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      position: 0,
      buttonText: "خرید",
      secondaryText: "جزئیات",
      productUrl: "#",
      chatbotId: chatbot.id,
    },
    {
      name: "محصول شماره ۲",
      description: "این محصول دیگری است",
      price: 200000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      position: 1,
      buttonText: "خرید",
      secondaryText: "جزئیات",
      productUrl: "#",
      chatbotId: chatbot.id,
    },
  ]

  for (const product of products) {
    await prisma.chatbotProduct.upsert({
      where: { id: product.position + 1 },
      update: {},
      create: product,
    })
  }

  console.log("✅ Created products")

  // Create sample options
  const options = [
    {
      label: "پشتیبانی فنی",
      emoji: "🔧",
      position: 0,
      chatbotId: chatbot.id,
    },
    {
      label: "اطلاعات محصولات",
      emoji: "📦",
      position: 1,
      chatbotId: chatbot.id,
    },
    {
      label: "پیگیری سفارش",
      emoji: "📋",
      position: 2,
      chatbotId: chatbot.id,
    },
  ]

  for (const option of options) {
    await prisma.chatbotOption.upsert({
      where: { id: option.position + 1 },
      update: {},
      create: option,
    })
  }

  console.log("✅ Created options")

  // Create sample admin user
  const adminUser = await prisma.chatbotAdminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      chatbotId: chatbot.id,
      username: "admin",
      passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      fullName: "مدیر سیستم",
      email: "admin@example.com",
      isActive: true,
    },
  })

  console.log("✅ Created admin user:", adminUser.username)

  // Create sample messages
  const messages = [
    {
      content: "سلام، چطور می‌تونم کمکتون کنم؟",
      role: "assistant",
      userMessage: null,
      botResponse: "سلام، چطور می‌تونم کمکتون کنم؟",
      chatbotId: chatbot.id,
      userId: user.id,
    },
    {
      content: "ساعات کاری شما چیست؟",
      role: "user",
      userMessage: "ساعات کاری شما چیست؟",
      botResponse: "ما از شنبه تا پنج‌شنبه از ساعت ۹ صبح تا ۶ عصر در خدمت شما هستیم.",
      chatbotId: chatbot.id,
      userId: user.id,
    },
  ]

  for (const message of messages) {
    await prisma.message.create({
      data: message,
    })
  }

  console.log("✅ Created sample messages")

  // Create sample ticket
  const ticket = await prisma.ticket.create({
    data: {
      chatbotId: chatbot.id,
      userId: user.id,
      name: "کاربر نمونه",
      email: "user@example.com",
      phone: "+989123456789",
      subject: "مشکل در سفارش",
      message: "سلام، من مشکلی در سفارش خود دارم. لطفاً کمک کنید.",
      status: "OPEN",
      priority: "NORMAL",
    },
  })

  // Create sample ticket response
  await prisma.ticketResponse.create({
    data: {
      ticketId: ticket.id,
      message: "سلام، ما سفارش شما را بررسی می‌کنیم و به زودی پاسخ خواهیم داد.",
      isAdmin: true,
    },
  })

  console.log("✅ Created sample ticket and response")

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
