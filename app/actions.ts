"use server"

import { getSql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createChatbot(formData: FormData) {
  const sql = getSql()
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) {
    return { success: false, message: "Chatbot name is required." }
  }

  try {
    const result = await sql`
      INSERT INTO chatbots (name, description)
      VALUES (${name}, ${description})
      RETURNING id;
    `
    revalidatePath("/chatbots")
    return { success: true, message: "Chatbot created successfully!", id: result[0].id }
  } catch (error) {
    console.error("Error creating chatbot:", error)
    return { success: false, message: "Failed to create chatbot." }
  }
}

export async function updateChatbotSettings(chatbotId: string, formData: FormData) {
  const sql = getSql()
  const welcomeMessage = formData.get("welcomeMessage") as string
  const primaryColor = formData.get("primaryColor") as string
  const secondaryColor = formData.get("secondaryColor") as string
  const textColor = formData.get("textColor") as string
  const botName = formData.get("botName") as string
  const botAvatar = formData.get("botAvatar") as string
  const userAvatar = formData.get("userAvatar") as string
  const showProductSuggestions = formData.get("showProductSuggestions") === "on"
  const showFaqSuggestions = formData.get("showFaqSuggestions") === "on"
  const showQuickOptions = formData.get("showQuickOptions") === "on"
  const showTicketForm = formData.get("showTicketForm") === "on"
  const model = formData.get("model") as string
  const temperature = Number.parseFloat(formData.get("temperature") as string)
  const maxTokens = Number.parseInt(formData.get("maxTokens") as string, 10)
  const topP = Number.parseFloat(formData.get("topP") as string)
  const frequencyPenalty = Number.parseFloat(formData.get("frequencyPenalty") as string)
  const presencePenalty = Number.parseFloat(formData.get("presencePenalty") as string)
  const statsMultiplier = Number.parseFloat(formData.get("statsMultiplier") as string)

  try {
    await sql`
      UPDATE chatbots
      SET
        welcome_message = ${welcomeMessage},
        primary_color = ${primaryColor},
        secondary_color = ${secondaryColor},
        text_color = ${textColor},
        bot_name = ${botName},
        bot_avatar = ${botAvatar},
        user_avatar = ${userAvatar},
        show_product_suggestions = ${showProductSuggestions},
        show_faq_suggestions = ${showFaqSuggestions},
        show_quick_options = ${showQuickOptions},
        show_ticket_form = ${showTicketForm},
        model = ${model},
        temperature = ${temperature},
        max_tokens = ${maxTokens},
        top_p = ${topP},
        frequency_penalty = ${frequencyPenalty},
        presence_penalty = ${presencePenalty},
        stats_multiplier = ${statsMultiplier}
      WHERE id = ${chatbotId};
    `
    revalidatePath(`/chatbots/${chatbotId}`)
    return { success: true, message: "Chatbot settings updated successfully!" }
  } catch (error) {
    console.error("Error updating chatbot settings:", error)
    return { success: false, message: "Failed to update chatbot settings." }
  }
}

export async function deleteChatbot(chatbotId: string) {
  const sql = getSql()
  try {
    await sql`DELETE FROM chatbots WHERE id = ${chatbotId};`
    revalidatePath("/chatbots")
    return { success: true, message: "Chatbot deleted successfully!" }
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return { success: false, message: "Failed to delete chatbot." }
  }
}

export async function createTicket(formData: FormData) {
  const sql = getSql()
  const chatbotId = formData.get("chatbotId") as string
  const userId = formData.get("userId") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string
  const userPhone = formData.get("userPhone") as string
  const userEmail = formData.get("userEmail") as string
  const imageUrl = formData.get("imageUrl") as string | null

  try {
    const result = await sql`
      INSERT INTO tickets (chatbot_id, user_id, subject, message, user_phone, user_email, image_url)
      VALUES (${chatbotId}, ${userId}, ${subject}, ${message}, ${userPhone}, ${userEmail}, ${imageUrl})
      RETURNING id;
    `
    revalidatePath(`/chatbots/${chatbotId}/tickets`)
    return { success: true, message: "Ticket created successfully!", id: result[0].id }
  } catch (error) {
    console.error("Error creating ticket:", error)
    return { success: false, message: "Failed to create ticket." }
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const sql = getSql()
  try {
    await sql`
      UPDATE tickets
      SET status = ${status}
      WHERE id = ${ticketId};
    `
    revalidatePath(`/admin/tickets`)
    revalidatePath(`/chatbots/${ticketId}/tickets`) // Assuming ticketId can be used to revalidate chatbot tickets
    return { success: true, message: "Ticket status updated successfully!" }
  } catch (error) {
    console.error("Error updating ticket status:", error)
    return { success: false, message: "Failed to update ticket status." }
  }
}

export async function addTicketResponse(ticketId: string, formData: FormData) {
  const sql = getSql()
  const responseMessage = formData.get("responseMessage") as string
  const isAdmin = formData.get("isAdmin") === "true"

  try {
    await sql`
      INSERT INTO ticket_responses (ticket_id, message, is_admin)
      VALUES (${ticketId}, ${responseMessage}, ${isAdmin});
    `
    revalidatePath(`/admin/tickets/${ticketId}`)
    return { success: true, message: "Response added successfully!" }
  } catch (error) {
    console.error("Error adding ticket response:", error)
    return { success: false, message: "Failed to add response." }
  }
}

export async function addFaq(chatbotId: string, formData: FormData) {
  const sql = getSql()
  const question = formData.get("question") as string
  const answer = formData.get("answer") as string

  try {
    await sql`
      INSERT INTO faqs (chatbot_id, question, answer)
      VALUES (${chatbotId}, ${question}, ${answer});
    `
    revalidatePath(`/chatbots/${chatbotId}/settings`)
    return { success: true, message: "FAQ added successfully!" }
  } catch (error) {
    console.error("Error adding FAQ:", error)
    return { success: false, message: "Failed to add FAQ." }
  }
}

export async function deleteFaq(faqId: string) {
  const sql = getSql()
  try {
    await sql`DELETE FROM faqs WHERE id = ${faqId};`
    revalidatePath("/chatbots/[id]/settings") // Revalidate a generic path, or specific if possible
    return { success: true, message: "FAQ deleted successfully!" }
  } catch (error) {
    console.error("Error deleting FAQ:", error)
    return { success: false, message: "Failed to delete FAQ." }
  }
}

export async function addProduct(chatbotId: string, formData: FormData) {
  const sql = getSql()
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const imageUrl = formData.get("imageUrl") as string
  const link = formData.get("link") as string

  try {
    await sql`
      INSERT INTO suggested_products (chatbot_id, name, description, image_url, link)
      VALUES (${chatbotId}, ${name}, ${description}, ${imageUrl}, ${link});
    `
    revalidatePath(`/chatbots/${chatbotId}/settings`)
    return { success: true, message: "Product added successfully!" }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, message: "Failed to add product." }
  }
}

export async function deleteProduct(productId: string) {
  const sql = getSql()
  try {
    await sql`DELETE FROM suggested_products WHERE id = ${productId};`
    revalidatePath("/chatbots/[id]/settings") // Revalidate a generic path, or specific if possible
    return { success: true, message: "Product deleted successfully!" }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, message: "Failed to delete product." }
  }
}

export async function addAdminUser(chatbotId: string, formData: FormData) {
  const sql = getSql()
  const username = formData.get("username") as string
  const password = formData.get("password") as string // In a real app, hash this!

  try {
    await sql`
      INSERT INTO admin_users (chatbot_id, username, password)
      VALUES (${chatbotId}, ${username}, ${password});
    `
    revalidatePath(`/chatbots/${chatbotId}/admin-users`)
    return { success: true, message: "Admin user added successfully!" }
  } catch (error) {
    console.error("Error adding admin user:", error)
    return { success: false, message: "Failed to add admin user." }
  }
}

export async function deleteAdminUser(userId: string) {
  const sql = getSql()
  try {
    await sql`DELETE FROM admin_users WHERE id = ${userId};`
    revalidatePath("/chatbots/[id]/admin-users") // Revalidate a generic path, or specific if possible
    return { success: true, message: "Admin user deleted successfully!" }
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return { success: false, message: "Failed to delete admin user." }
  }
}
