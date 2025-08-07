import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      },
    },
  }),
  ...(process.env.NODE_ENV === 'production' && {
    formatters: {
      level: (label) => {
        return { level: label }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
})

export default logger

export const createLogger = (service: string) => {
  return logger.child({ service })
}

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, 'Application error occurred')
}

export const logInfo = (message: string, data?: Record<string, any>) => {
  logger.info(data, message)
}

export const logWarn = (message: string, data?: Record<string, any>) => {
  logger.warn(data, message)
}

export const logDebug = (message: string, data?: Record<string, any>) => {
  logger.debug(data, message)
}
