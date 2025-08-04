import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for GET requests
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = params.id

  // Fetch user statistics for the chatbot
  const usersStats = await sql`
    SELECT COUNT(*) AS userCount
    FROM users
    WHERE chatbot_id = ${chatbotId}
  `

  // Return the response with user statistics
  return new Response(JSON.stringify(usersStats), {
    headers: { "Content-Type": "application/json" },
  })
}
