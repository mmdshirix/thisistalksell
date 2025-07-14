import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create sample chatbot
  const chatbot = await prisma.chatbot.create({
    data: {
      name: "فروشگاه تکنولوژی پیشرفته",
      welcomeMessage:
        "سلام! به فروشگاه تکنولوژی پیشرفته خوش آمدید 🚀\nمن دستیار هوشمند شما هستم و آماده کمک برای یافتن بهترین محصولات تکنولوژی!",
      navigationMessage: "چه چیزی دنبال می‌کنید؟ لپ‌تاپ، موبایل، یا شاید هدفون؟",
      primaryColor: "#2563eb",
      textColor: "#ffffff",
      backgroundColor: "#f8fafc",
      chatIcon: "🤖",
      position: "bottom-right",
      knowledgeBaseText:
        "ما یک فروشگاه تکنولوژی پیشرفته هستیم که انواع لپ‌تاپ، موبایل، هدفون، ساعت هوشمند و لوازم جانبی عرضه می‌کنیم. تمام محصولات ما اورجینال و دارای گارانتی معتبر هستند.",
      storeUrl: "https://tech-store.example.com",
      statsMultiplier: 2.5,
    },
  })

  console.log(`✅ Created chatbot: ${chatbot.name}`)

  // Create sample FAQs
  const faqs = await prisma.chatbotFAQ.createMany({
    data: [
      {
        chatbotId: chatbot.id,
        question: "قیمت لپ‌تاپ‌ها چقدر است؟",
        answer:
          "قیمت لپ‌تاپ‌های ما از ۱۵ میلیون تومان شروع می‌شود و تا ۸۰ میلیون تومان متغیر است. بسته به مارک، مشخصات و نیاز شما.",
        emoji: "💻",
        position: 1,
      },
      {
        chatbotId: chatbot.id,
        question: "گارانتی محصولات چقدر است؟",
        answer: "تمام محصولات ما دارای گارانتی ۱۸ ماهه شرکتی و ۲۴ ماهه گارانتی بین‌المللی هستند.",
        emoji: "🛡️",
        position: 2,
      },
      {
        chatbotId: chatbot.id,
        question: "امکان ارسال رایگان دارید؟",
        answer:
          "برای خریدهای بالای ۵ میلیون تومان، ارسال کاملاً رایگان است. زیر این مبلغ ۲۰۰ هزار تومان هزینه ارسال داریم.",
        emoji: "🚚",
        position: 3,
      },
      {
        chatbotId: chatbot.id,
        question: "چه برندهایی دارید؟",
        answer: "ما محصولات اپل، سامسونگ، هواوی، شیائومی، ایسوس، اچ‌پی، دل و سونی را عرضه می‌کنیم.",
        emoji: "🏪",
        position: 4,
      },
    ],
  })

  console.log(`✅ Created ${faqs.count} FAQs`)

  // Create sample products
  const products = await prisma.chatbotProduct.createMany({
    data: [
      {
        chatbotId: chatbot.id,
        name: "لپ‌تاپ MacBook Pro M3",
        description: "لپ‌تاپ قدرتمند اپل با چیپ M3، مناسب برای کارهای حرفه‌ای و طراحی",
        price: 65000000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        buttonText: "خرید فوری",
        secondaryText: "مشاهده مشخصات",
        productUrl: "https://tech-store.example.com/macbook-pro-m3",
        position: 1,
      },
      {
        chatbotId: chatbot.id,
        name: "گوشی iPhone 15 Pro Max",
        description: "جدیدترین آیفون با دوربین 48 مگاپیکسل و چیپ A17 Pro",
        price: 52000000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        buttonText: "سفارش دهید",
        secondaryText: "مقایسه قیمت",
        productUrl: "https://tech-store.example.com/iphone-15-pro-max",
        position: 2,
      },
      {
        chatbotId: chatbot.id,
        name: "هدفون Sony WH-1000XM5",
        description: "هدفون بی‌سیم با حذف نویز فعال و کیفیت صدای بی‌نظیر",
        price: 8500000,
        imageUrl: "/placeholder.svg?height=300&width=300",
        buttonText: "اضافه به سبد",
        secondaryText: "شنیدن نمونه",
        productUrl: "https://tech-store.example.com/sony-wh1000xm5",
        position: 3,
      },
    ],
  })

  console.log(`✅ Created ${products.count} products`)

  // Create sample options
  const options = await prisma.chatbotOption.createMany({
    data: [
      {
        chatbotId: chatbot.id,
        label: "مشاهده لپ‌تاپ‌ها",
        emoji: "💻",
        position: 1,
      },
      {
        chatbotId: chatbot.id,
        label: "گوشی‌های موبایل",
        emoji: "📱",
        position: 2,
      },
      {
        chatbotId: chatbot.id,
        label: "هدفون و صوتی",
        emoji: "🎧",
        position: 3,
      },
      {
        chatbotId: chatbot.id,
        label: "پشتیبانی فنی",
        emoji: "🛠️",
        position: 4,
      },
    ],
  })

  console.log(`✅ Created ${options.count} options`)

  // Create sample messages
  const messages = await prisma.chatbotMessage.createMany({
    data: [
      {
        chatbotId: chatbot.id,
        userMessage: "سلام، لپ‌تاپ گیمینگ دارید؟",
        botResponse: "سلام! بله، ما انواع لپ‌تاپ‌های گیمینگ داریم. آیا بودجه خاصی در نظر دارید؟",
        userIp: "192.168.1.100",
        userAgent: "Mozilla/5.0",
      },
      {
        chatbotId: chatbot.id,
        userMessage: "حدود ۳۰ میلیون تومان",
        botResponse: "عالی! برای این بودجه چندین گزینه عالی داریم. لپ‌تاپ‌های ایسوس ROG و MSI Gaming را پیشنهاد می‌دهم.",
        userIp: "192.168.1.100",
        userAgent: "Mozilla/5.0",
      },
      {
        chatbotId: chatbot.id,
        userMessage: "آیفون ۱۵ در دسترس است؟",
        botResponse: "بله! آیفون ۱۵ در تمام رنگ‌ها و حافظه‌ها موجود است. کدام مدل را ترجیح می‌دهید؟",
        userIp: "192.168.1.101",
        userAgent: "Mozilla/5.0",
      },
    ],
  })

  console.log(`✅ Created ${messages.count} sample messages`)

  // Create sample tickets
  const tickets = await prisma.ticket.createMany({
    data: [
      {
        chatbotId: chatbot.id,
        name: "علی احمدی",
        email: "ali.ahmadi@email.com",
        phone: "09123456789",
        subject: "مشکل در پرداخت",
        message: "سلام، من سعی کردم لپ‌تاپ MacBook Pro را خریداری کنم اما در مرحله پرداخت مشکل دارم.",
        status: "OPEN",
        priority: "HIGH",
        userIp: "192.168.1.100",
      },
      {
        chatbotId: chatbot.id,
        name: "فاطمه محمدی",
        email: "fateme.mohammadi@email.com",
        phone: "09987654321",
        subject: "سوال درباره گارانتی",
        message: "آیا گوشی‌های شما گارانتی اصلی دارند؟ آیا امکان تعویض در صورت مشکل وجود دارد؟",
        status: "PENDING",
        priority: "NORMAL",
        userIp: "192.168.1.101",
      },
    ],
  })

  console.log(`✅ Created ${tickets.count} sample tickets`)

  // Create sample admin user
  const adminUser = await prisma.chatbotAdminUser.create({
    data: {
      chatbotId: chatbot.id,
      username: "admin_tech",
      passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMye.Uo/hBIKwR7O4RGi5lWjllbfVV1dOYu", // password: "password123"
      fullName: "مدیر فروشگاه تکنولوژی",
      email: "admin@tech-store.com",
      isActive: true,
    },
  })

  console.log(`✅ Created admin user: ${adminUser.username}`)

  console.log("🎉 Database seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
