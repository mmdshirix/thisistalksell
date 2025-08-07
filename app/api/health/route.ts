import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/db'

export async function GET() {
  try {
    const dbResult = await testDatabaseConnection()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbResult.success ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV,
      version: '1.0.0',
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: String(error),
      environment: process.env.NODE_ENV,
    }, { status: 503 })
  }
}
