import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/db'
import { APP_CONFIG } from '@/utils/constants'
import logger from '@/lib/logger'

export async function GET() {
  try {
    const startTime = Date.now()
    const dbConnected = await checkDatabaseConnection()
    const responseTime = Date.now() - startTime

    const health = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: APP_CONFIG.version,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: dbConnected,
        responseTime: `${responseTime}ms`,
      },
      services: {
        api: 'operational',
        database: dbConnected ? 'operational' : 'down',
      },
    }

    logger.info('Health check performed', { 
      status: health.status,
      responseTime: health.database.responseTime 
    })

    return NextResponse.json(health, {
      status: dbConnected ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}
