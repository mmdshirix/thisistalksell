import { NextResponse } from "next/server"
import { queryDB } from "@/lib/db"

/**
 * A backend-only API route to test the database connection.
 * It executes a simple query and returns the current time from the database.
 */
export async function GET() {
  try {
    // Execute a simple query to get the current timestamp from the database.
    const { rows } = await queryDB<{ now: string }>("SELECT NOW()")

    // If the query is successful, return a success message with the timestamp.
    return NextResponse.json({
      message: "Database connection successful!",
      timestamp: rows[0].now,
    })
  } catch (error) {
    // If an error occurs, log it and return a 500 status code.
    console.error("Database connection test failed:", error)
    return NextResponse.json(
      {
        message: "Database connection failed",
        // Provide the error message for easier debugging.
        error: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
