import pino from "pino"

const isDevelopment = process.env.NODE_ENV === "development"

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["password", "token", "authorization", "cookie"],
    censor: "[REDACTED]",
  },
})

// Create child loggers for different modules
export const dbLogger = logger.child({ module: "database" })
export const authLogger = logger.child({ module: "auth" })
export const apiLogger = logger.child({ module: "api" })

// Export as both named and default export for compatibility
export { logger }
export default logger
