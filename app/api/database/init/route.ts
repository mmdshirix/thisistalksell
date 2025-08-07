import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db'

export async function POST() {
  try {
    const result = await initializeDatabase()
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({
      success: false,
      message: `Database initialization failed: ${error}`,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to initialize database",
    endpoint: "/api/database/init",
    method: "POST"
  }, { status: 405 })
}
