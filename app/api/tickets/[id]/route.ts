import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for the tickets API
export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === "GET") {
    // Handle GET request to fetch a ticket by ID
    try {
      const ticket = await sql`SELECT * FROM tickets WHERE id = ${id}`
      res.status(200).json(ticket)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" })
    }
  } else if (req.method === "PUT") {
    // Handle PUT request to update a ticket by ID
    try {
      const { title, description } = req.body
      await sql`UPDATE tickets SET title = ${title}, description = ${description} WHERE id = ${id}`
      res.status(200).json({ message: "Ticket updated successfully" })
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" })
    }
  } else if (req.method === "DELETE") {
    // Handle DELETE request to remove a ticket by ID
    try {
      await sql`DELETE FROM tickets WHERE id = ${id}`
      res.status(200).json({ message: "Ticket deleted successfully" })
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ticket" })
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET", "PUT", "DELETE"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
