import { getSql } from "@/lib/db"
const sql = getSql()

// Define your route handler here
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Example logic for handling GET request
  const { id } = params
  const result = await sql`SELECT * FROM admin_panel WHERE id = ${id}`
  return new Response(JSON.stringify(result))
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Example logic for handling POST request
  const { id } = params
  const body = await request.json()
  const result = await sql`UPDATE admin_panel SET appearance = ${body.appearance} WHERE id = ${id}`
  return new Response(JSON.stringify(result))
}
