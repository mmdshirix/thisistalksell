import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create a sample user
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

  // Create a sample chatbot
  const chatbot = await prisma.chatbot.upsert({
    where: { id: "sample-chatbot-id" },
    update: {},
    create: {
      id: "sample-chatbot-id",
      name: "نمونه چت‌بات",
      description: "این یک چت‌بات نمونه برای تست است",
      userId: user.id,
      welcomeMessage: "سلام! به چت‌بات ما خوش آمدید. چطور می‌تونم کمکتون کنم؟",
      placeholder: "سوال خود را بپرسید...",
      primaryColor: "#3B82F6",
      secondaryColor: "#EFF6FF",
      totalMessages: 150,
      totalUsers: 45,
      statsMultiplier: 2.5,
    },
  })

  console.log("✅ Created chatbot:", chatbot.name)

  // Create sample FAQs
  const faqs = [
    {
      question: "ساعات کاری شما چیست؟",
      answer: "ما از شنبه تا چهارشنبه از ساعت 8 صبح تا 6 عصر در خدمت شما هستیم.",
      position: 1,
    },
    {
      question: "چطور می‌تونم سفارش بدم؟",
      answer: "شما می‌تونید از طریق وب‌سایت ما یا تماس با شماره پشتیبانی سفارش بدید.",
      position: 2,
    },
    {
      question: "هزینه ارسال چقدره؟",
      answer: "هزینه ارسال بسته به منطقه و وزن محصول متفاوته. برای سفارش‌های بالای 500 هزار تومان ارسال رایگانه.",
      position: 3,
    },
  ]

  for (const faq of faqs) {
    await prisma.fAQ.upsert({
      where: {
        chatbotId_question: {
          chatbotId: chatbot.id,
          question: faq.question,
        },
      },
      update: {},
      create: {
        ...faq,
        chatbotId: chatbot.id,
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
      imageUrl: "/placeholder.svg?height=200&width=200",
      url: "https://example.com/gaming-laptop",
      position: 1,
    },
    {
      name: "هدفون بی‌سیم",
      description: "هدفون با کیفیت صدای عالی",
      price: 1500000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      url: "https://example.com/wireless-headphones",
      position: 2,
    },
    {
      name: "موس گیمینگ",
      description: "موس دقیق برای بازی‌های حرفه‌ای",
      price: 800000,
      imageUrl: "/placeholder.svg?height=200&width=200",
      url: "https://example.com/gaming-mouse",
      position: 3,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        chatbotId_name: {
          chatbotId: chatbot.id,
          name: product.name,
        },
      },
      update: {},
      create: {
        ...product,
        chatbotId: chatbot.id,
      },
    })
  }

  console.log("✅ Created products")

  // Create admin user
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "admin123", // In production, this should be hashed
      chatbotId: chatbot.id,
    },
  })

  console.log("✅ Created admin user")

  // Create sample messages
  const messages = [
    { content: "سلام", role: "USER" as const },
    { content: "سلام! چطور می‌تونم کمکتون کنم؟", role: "ASSISTANT" as const },
    { content: "ساعات کاری شما چیست؟", role: "USER" as const },
    { content: "ما از شنبه تا چهارشنبه از ساعت 8 صبح تا 6 عصر در خدمت شما هستیم.", role: "ASSISTANT" as const },
  ]

  for (const message of messages) {
    await prisma.message.create({
      data: {
        ...message,
        chatbotId: chatbot.id,
        userId: message.role === "USER" ? user.id : null,
      },
    })
  }

  console.log("✅ Created sample messages")

  // Create sample ticket
  await prisma.ticket.create({
    data: {
      title: "مشکل در پرداخت",
      description: "سلام، من نمی‌تونم پرداخت رو تکمیل کنم. لطفاً کمک کنید.",
      status: "OPEN",
      priority: "HIGH",
      chatbotId: chatbot.id,
      userId: user.id,
      responses: {
        create: [
          {
            content: "سلام، ممنون که با ما تماس گرفتید. لطفاً جزئیات بیشتری از مشکل بگید.",
            isAdmin: true,
          },
        ],
      },
    },
  })

  console.log("✅ Created sample ticket")

  console.log("🎉 Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
