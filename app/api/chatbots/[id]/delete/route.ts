import { getSql } from "@/lib/db"
const sql = getSql()

// Define the DELETE route handler for chatbots by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    // Execute the SQL query to delete the chatbot by ID
    await sql`DELETE FROM chatbots WHERE id = ${id}`

    // Return a success response
    return new Response(null, { status: 204 })
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error deleting chatbot:", error)

    // Return an error response
    return new Response(JSON.stringify({ error: "Failed to delete chatbot" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
