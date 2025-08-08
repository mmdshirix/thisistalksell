export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { createApiResponse } from '@/utils/validation'
import logger from '@/lib/logger'
import { testDatabaseConnection, initializeDatabase, getActiveDbEnvVar } from "@/lib/db"

// GET diagnostics (avoid 405)
export async function GET() {
  const result = await testDatabaseConnection()
  return NextResponse.json(
    {
      ok: result.ok,
      usingEnvVar: result.usingEnvVar ?? getActiveDbEnvVar(),
      error: result.error ?? null,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    { status: result.ok ? 200 : 500 }
  )
}

// POST idempotent initializer
export async function POST() {
  try {
    logger.info('Initializing database...')

    const res = await initializeDatabase()

    if (!res.success) {
      return NextResponse.json(
        {
          success: res.success,
          message: res.message,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        { status: 500 }
      )
    }

    const result = {
      admin: res.admin,
      chatbot: res.chatbot,
      message: 'Database initialized successfully',
    }

    logger.info('Database initialization completed', result)

    return NextResponse.json(
      {
        success: res.success,
        message: res.message,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Database initialization failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database initialization failed',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
