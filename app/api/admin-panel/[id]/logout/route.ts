import { getSql } from "@/lib/db"
const sql = getSql()

// Assuming the rest of the code involves handling the logout logic
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  // Logic to handle logout for the admin panel user with the given id
  // For example, clearing session data or updating user status
  // Placeholder for actual logout logic
  return new Response(`Admin panel user with id ${id} has been logged out.`)
}
