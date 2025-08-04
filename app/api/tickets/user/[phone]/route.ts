import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for user tickets by phone
export async function GET(request: Request, { params }: { params: { phone: string } }) {
  const { phone } = params

  // Fetch tickets for the user with the given phone number
  const tickets = await sql`
    SELECT * FROM tickets WHERE user_phone = ${phone}
  `

  // Return the tickets as a JSON response
  return new Response(JSON.stringify(tickets), {
    headers: { "Content-Type": "application/json" },
  })
}

// Define the route handler for creating a new ticket for a user by phone
export async function POST(request: Request, { params }: { params: { phone: string } }) {
  const { phone } = params
  const { title, description } = await request.json()

  // Insert a new ticket into the database
  const newTicket = await sql`
    INSERT INTO tickets (user_phone, title, description) VALUES (${phone}, ${title}, ${description})
    RETURNING *
  `

  // Return the newly created ticket as a JSON response
  return new Response(JSON.stringify(newTicket), {
    headers: { "Content-Type": "application/json" },
  })
}
