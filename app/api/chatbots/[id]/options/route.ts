import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for chatbots options
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  // Fetch options for the chatbot with the given id
  const options = await sql`SELECT * FROM chatbot_options WHERE chatbot_id = ${id}`
  return new Response(JSON.stringify(options))
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const data = await request.json()
  // Update options for the chatbot with the given id
  await sql`UPDATE chatbot_options SET ${sql(data)} WHERE chatbot_id = ${id}`
  return new Response(JSON.stringify({ success: true }))
}
