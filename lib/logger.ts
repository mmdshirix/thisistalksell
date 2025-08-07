import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

// Helper functions for structured logging
export const logError = (message: string, error: any, context?: any) => {
  logger.error({
    message,
    error: {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    },
    context,
  })
}

export const logInfo = (message: string, context?: any) => {
  logger.info({ message, context })
}

export const logWarning = (message: string, context?: any) => {
  logger.warn({ message, context })
}

export const logDebug = (message: string, context?: any) => {
  logger.debug({ message, context })
}
