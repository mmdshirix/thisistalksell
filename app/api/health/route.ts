import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    // Test database connection
    await testConnection()
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    }

    logger.info('Health check passed', healthStatus)
    
    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'disconnected'
    }

    logger.error('Health check failed', errorStatus)
    
    return NextResponse.json(errorStatus, { status: 503 })
  }
}
