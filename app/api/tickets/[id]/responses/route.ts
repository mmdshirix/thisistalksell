import { getSql } from "@/lib/db"
const sql = getSql()

// Define the API route for handling ticket responses
export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    // Handle GET request to fetch responses for a specific ticket
    try {
      const responses = await sql`SELECT * FROM ticket_responses WHERE ticket_id = ${id}`
      res.status(200).json(responses)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket responses" })
    }
  } else if (req.method === "POST") {
    // Handle POST request to add a new response to a specific ticket
    const { content } = req.body
    try {
      const newResponse =
        await sql`INSERT INTO ticket_responses (ticket_id, content) VALUES (${id}, ${content}) RETURNING *`
      res.status(201).json(newResponse)
    } catch (error) {
      res.status(500).json({ error: "Failed to add ticket response" })
    }
  } else {
    // Handle other HTTP methods
    res.status(405).json({ error: "Method not allowed" })
  }
}
