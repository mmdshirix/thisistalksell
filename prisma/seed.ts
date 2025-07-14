import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create sample chatbot
  const chatbot = await prisma.chatbot.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "چت‌بات نمونه",
      welcomeMessage: "سلام! چطور می‌توانم به شما کمک کنم؟",
      navigationMessage: "چه چیزی شما را به اینجا آورده است؟",
      primaryColor: "#14b8a6",
      textColor: "#ffffff",
      backgroundColor: "#f3f4f6",
      chatIcon: "💬",
      position: "bottom-right",
      marginX: 20,
      marginY: 20,
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
      answer: "ما از شنبه تا چهارشنبه از ساعت 9 صبح تا 6 عصر در خدمت شما هستیم.",
      emoji: "🕒",
      position: 0,
    },
    {
      question: "چگونه می‌توانم سفارش دهم؟",
      answer: "شما می‌توانید از طریق وب‌سایت ما یا تماس تلفنی سفارش خود را ثبت کنید.",
      emoji: "🛒",
      position: 1,
    },
    {
      question: "آیا ارسال رایگان دارید؟",
      answer: "بله، برای سفارش‌های بالای 500 هزار تومان ارسال رایگان است.",
      emoji: "🚚",
      position: 2,
    },
  ]

  for (const faq of faqs) {
    await prisma.chatbotFAQ.upsert({
      where: {
        chatbotId_question: {
          chatbotId: chatbot.id,
          question: faq.question,
        },
      },
      update: {},
      create: {
        chatbotId: chatbot.id,
        ...faq,
      },
    })
  }

  console.log("✅ Created FAQs")

  // Create sample products
  const products = [
    {
      name: "محصول شماره 1",
      description: "توضیحات محصول شماره 1",
      price: 100000,
      buttonText: "خرید",
      secondaryText: "جزئیات",
      position: 0,
    },
    {
      name: "محصول شماره 2",
      description: "توضیحات محصول شماره 2",
      price: 200000,
      buttonText: "خرید",
      secondaryText: "جزئیات",
      position: 1,
    },
  ]

  for (const product of products) {
    await prisma.chatbotProduct.upsert({
      where: {
        chatbotId_name: {
          chatbotId: chatbot.id,
          name: product.name,
        },
      },
      update: {},
      create: {
        chatbotId: chatbot.id,
        ...product,
      },
    })
  }

  console.log("✅ Created products")

  // Create sample options
  const options = [
    {
      label: "پشتیبانی فنی",
      emoji: "🔧",
      position: 0,
    },
    {
      label: "فروش",
      emoji: "💰",
      position: 1,
    },
    {
      label: "اطلاعات عمومی",
      emoji: "ℹ️",
      position: 2,
    },
  ]

  for (const option of options) {
    await prisma.chatbotOption.upsert({
      where: {
        chatbotId_label: {
          chatbotId: chatbot.id,
          label: option.label,
        },
      },
      update: {},
      create: {
        chatbotId: chatbot.id,
        ...option,
      },
    })
  }

  console.log("✅ Created options")

  // Create sample admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)

  await prisma.chatbotAdminUser.upsert({
    where: {
      chatbotId_username: {
        chatbotId: chatbot.id,
        username: "admin",
      },
    },
    update: {},
    create: {
      chatbotId: chatbot.id,
      username: "admin",
      passwordHash: hashedPassword,
      fullName: "مدیر سیستم",
      email: "admin@example.com",
      isActive: true,
    },
  })

  console.log("✅ Created admin user (username: admin, password: admin123)")

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "کاربر نمونه",
      email: "user@example.com",
      phone: "09123456789",
    },
  })

  console.log("✅ Created sample user")

  // Create sample messages
  const messages = [
    {
      content: "سلام، چطور می‌توانم کمک کنم؟",
      role: "user",
      userMessage: "سلام، چطور می‌توانم کمک کنم؟",
      botResponse: "سلام! خوش آمدید. چه کمکی از دست من برمی‌آید؟",
    },
    {
      content: "ساعات کاری شما چیست؟",
      role: "user",
      userMessage: "ساعات کاری شما چیست؟",
      botResponse: "ما از شنبه تا چهارشنبه از ساعت 9 صبح تا 6 عصر در خدمت شما هستیم.",
    },
  ]

  for (const message of messages) {
    await prisma.message.create({
      data: {
        chatbotId: chatbot.id,
        userId: user.id,
        userIp: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Sample)",
        ...message,
      },
    })
  }

  console.log("✅ Created sample messages")

  // Create sample ticket
  await prisma.ticket.create({
    data: {
      chatbotId: chatbot.id,
      userId: user.id,
      name: "کاربر نمونه",
      email: "user@example.com",
      phone: "09123456789",
      subject: "مشکل در سفارش",
      message: "سلام، من مشکلی در ثبت سفارش دارم. لطفاً کمک کنید.",
      status: "OPEN",
      userIp: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Sample)",
    },
  })

  console.log("✅ Created sample ticket")

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
