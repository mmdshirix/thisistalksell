import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler here
export default async function handler(req, res) {
  // Extract the chatbot ID from the request
  const { id } = req.query

  // Check if the chatbot ID is valid
  if (!id) {
    return res.status(400).json({ error: "Invalid chatbot ID" })
  }

  // Query the database to check the chatbot status
  const chatbot = await sql`SELECT * FROM chatbots WHERE id = ${id}`

  // Check if the chatbot exists
  if (!chatbot.length) {
    return res.status(404).json({ error: "Chatbot not found" })
  }

  // Return the chatbot status
  res.status(200).json({ status: chatbot[0].status })
}
