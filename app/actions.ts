"use server"

import {
  createChatbot as createChatbotInDB,
  getChatbotMessages,
  getChatbotFAQs as getChatbotFAQsFromDB,
} from "@/lib/db"
import { revalidatePath } from "next/cache"

// Export createChatbot function
export const createChatbot = createChatbotInDB

export async function createChatbotAction(formData: FormData) {
  const name = formData.get("name") as string

  if (!name || name.trim() === "") {
    return { success: false, error: "نام چت‌بات الزامی است" }
  }

  const welcomeMessage = formData.get("welcome_message") as string
  const primaryColor = formData.get("primary_color") as string
  const textColor = formData.get("text_color") as string
  const backgroundColor = formData.get("background_color") as string
  const chatIcon = formData.get("chat_icon") as string
  const position = formData.get("position") as string

  try {
    const chatbot = await createChatbotInDB({
      name: name.trim(),
      welcome_message: welcomeMessage || "سلام! چطور می‌توانم به شما کمک کنم؟",
      primary_color: primaryColor || "#0066FF",
      text_color: textColor || "#333333",
      background_color: backgroundColor || "#FFFFFF",
      chat_icon: chatIcon || "💬",
      position: position || "bottom-right",
    })

    revalidatePath("/")
    return { success: true, chatbot }
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داده است",
    }
  }
}

export async function getChatbotAnalytics(chatbotId: number) {
  try {
    const messages = await getChatbotMessages(chatbotId)
    const faqs = await getChatbotFAQsFromDB(chatbotId)

    return {
      totalMessages: messages.length,
      totalFAQs: faqs.length,
      recentMessages: messages.slice(0, 10),
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      totalMessages: 0,
      totalFAQs: 0,
      recentMessages: [],
    }
  }
}
