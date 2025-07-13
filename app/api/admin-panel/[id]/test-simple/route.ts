import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number(params.id)

    console.log(`🧪 Simple test for chatbot ${chatbotId}`)

    // Return simple test data without database
    const testData = {
      chatbot: {
        id: chatbotId,
        name: `چت‌بات تست ${chatbotId}`,
        multiplier: 1.0,
      },
      stats: {
        totalMessages: 10,
        uniqueUsers: 5,
        avgMessagesPerUser: 2,
        todayMessages: 3,
        thisWeekMessages: 8,
        todayGrowth: 0,
        activeTickets: 2,
        resolvedTickets: 1,
      },
      messages: [
        {
          id: 1,
          user_message: "سلام",
          bot_response: "سلام! چطور می‌توانم کمکتان کنم؟",
          timestamp: new Date().toISOString(),
          user_ip: "192.168.1.1",
        },
        {
          id: 2,
          user_message: "محصولات شما چیست؟",
          bot_response: "ما انواع محصولات تکنولوژی داریم.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user_ip: "192.168.1.2",
        },
      ],
      todayMessages: [
        {
          id: 3,
          user_message: "قیمت چقدر است؟",
          bot_response: "قیمت‌ها متغیر هستند.",
          timestamp: new Date().toISOString(),
          user_ip: "192.168.1.3",
        },
      ],
      tickets: [
        {
          id: 1,
          subject: "مشکل در پرداخت",
          message: "نمی‌توانم پرداخت کنم",
          status: "open",
          priority: "high",
          created_at: new Date().toISOString(),
        },
      ],
      analytics: {
        dailyData: [
          { name: "ش", value: 2 },
          { name: "ی", value: 1 },
          { name: "د", value: 3 },
          { name: "س", value: 0 },
          { name: "چ", value: 1 },
          { name: "پ", value: 2 },
          { name: "ج", value: 1 },
        ],
        weeklyData: [
          { name: "هفته 1", value: 5 },
          { name: "هفته 2", value: 8 },
          { name: "هفته 3", value: 3 },
          { name: "هفته 4", value: 10 },
        ],
        monthlyData: [
          { name: "فرو", value: 15 },
          { name: "ارد", value: 20 },
          { name: "خرد", value: 18 },
          { name: "تیر", value: 25 },
        ],
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          value: Math.floor(Math.random() * 5),
        })),
        responseTimeData: [
          { name: "پیام 1", value: 1.2 },
          { name: "پیام 2", value: 0.8 },
          { name: "پیام 3", value: 1.5 },
          { name: "پیام 4", value: 0.9 },
          { name: "پیام 5", value: 1.1 },
        ],
        userEngagement: [
          { name: "شنبه", messages: 5, users: 3 },
          { name: "یکشنبه", messages: 8, users: 4 },
          { name: "دوشنبه", messages: 3, users: 2 },
          { name: "سه‌شنبه", messages: 6, users: 3 },
          { name: "چهارشنبه", messages: 4, users: 2 },
          { name: "پنجشنبه", messages: 7, users: 4 },
          { name: "جمعه", messages: 2, users: 1 },
        ],
        topQuestions: [
          { question: "محصولات شما چیست؟", count: 5, lastAsked: new Date().toISOString() },
          { question: "قیمت چقدر است؟", count: 3, lastAsked: new Date().toISOString() },
          { question: "ارسال رایگان دارید؟", count: 2, lastAsked: new Date().toISOString() },
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        dataSource: "test_simple",
        multiplier: 1.0,
      },
    }

    console.log(`✅ Simple test successful for chatbot ${chatbotId}`)
    return NextResponse.json(testData)
  } catch (error) {
    console.error("❌ Error in simple test:", error)
    return NextResponse.json(
      {
        error: "خطا در تست ساده",
        details: error instanceof Error ? error.message : "خطای نامشخص",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
