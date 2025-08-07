import { NextResponse } from 'next/server'
import { checkDatabaseConnection, prisma } from '@/lib/db'
import { createApiResponse } from '@/utils/validation'
import logger from '@/lib/logger'

export async function GET() {
  try {
    logger.info('Testing database connection...')
    
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        createApiResponse(false, null, 'Database connection failed'),
        { status: 503 }
      )
    }

    // Test basic query
    const chatbotCount = await prisma.chatbots.count()
    const adminCount = await prisma.admin_users.count()
    
    const testResults = {
      connection: 'successful',
      chatbots: chatbotCount,
      admins: adminCount,
      timestamp: new Date().toISOString(),
    }

    logger.info('Database test completed successfully', testResults)

    return NextResponse.json(
      createApiResponse(true, testResults, 'Database test successful'),
      { status: 200 }
    )
  } catch (error) {
    logger.error('Database test failed:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, 'Database test failed', [
        error instanceof Error ? error.message : 'Unknown error'
      ]),
      { status: 500 }
    )
  }
}
