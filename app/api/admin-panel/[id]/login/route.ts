import { getSql } from "@/lib/db"
const sql = getSql()

// Define the route handler for the admin panel login
export async function POST(request: Request) {
  const { id } = request.params
  const { username, password } = await request.json()

  // Validate the input
  if (!username || !password) {
    return new Response("Invalid input", { status: 400 })
  }

  // Query the database for the user
  const user = await sql`
    SELECT * FROM users WHERE username = ${username}
  `

  // Check if the user exists and the password is correct
  if (user.length === 0 || user[0].password !== password) {
    return new Response("Invalid credentials", { status: 401 })
  }

  // Generate a token for the user
  const token = generateToken(user[0].id)

  // Return the token
  return new Response(JSON.stringify({ token }), { status: 200 })
}

// Function to generate a token (placeholder implementation)
function generateToken(userId: string): string {
  return `token-${userId}`
}
