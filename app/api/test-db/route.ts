import { NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET() {
  let pool: Pool | null = null

  try {
    // Create connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })

    // Test connection
    const client = await pool.connect()

    try {
      // Get connection info
      const connectionInfo = {
        host: client.host,
        database: client.database,
        user: client.user,
      }

      // Get list of tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)

      const tables = tablesResult.rows.map((row) => row.table_name)

      client.release()

      return NextResponse.json({
        connected: true,
        tables,
        connectionInfo,
        timestamp: new Date().toISOString(),
      })
    } catch (queryError) {
      client.release()
      throw queryError
    }
  } catch (error: any) {
    console.error("Database connection error:", error)

    return NextResponse.json({
      connected: false,
      tables: [],
      error: error.message || "خطای ناشناخته در اتصال به دیتابیس",
      timestamp: new Date().toISOString(),
    })
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}
