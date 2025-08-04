import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for chatbots stats messages
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = params.id

  // Fetch message statistics for the chatbot
  const messageStats = await sql`
    SELECT COUNT(*) AS message_count
    FROM messages
    WHERE chatbot_id = ${chatbotId}
  `

  // Return the message statistics as a JSON response
  return new Response(JSON.stringify(messageStats), {
    headers: { "Content-Type": "application/json" },
  })
}
