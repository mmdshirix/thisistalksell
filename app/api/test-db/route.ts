import { testDatabaseConnection, initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    const connectionResult = await testDatabaseConnection()

    if (connectionResult.success) {
      // If connection is successful, also test database initialization
      const initResult = await initializeDatabase()

      return Response.json({
        connection: connectionResult,
        initialization: initResult,
        timestamp: new Date().toISOString(),
      })
    } else {
      return Response.json(
        {
          connection: connectionResult,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    return Response.json(
      {
        error: "Database test failed",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
