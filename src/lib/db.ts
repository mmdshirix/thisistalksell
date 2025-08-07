import { PrismaClient } from '@prisma/client'
import logger from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    logger.info('Database connection successful')
    return true
  } catch (error) {
    logger.error('Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info('Database disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting from database:', error)
  }
}

// Handle process termination
process.on('beforeExit', async () => {
  await disconnectDatabase()
})

process.on('SIGINT', async () => {
  await disconnectDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDatabase()
  process.exit(0)
})

export default prisma
