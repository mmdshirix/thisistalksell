export const APP_CONFIG = {
  name: 'ChatBot Platform',
  version: '1.0.0',
  description: 'Advanced chatbot management platform',
  author: 'Your Company',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export const DATABASE_CONFIG = {
  maxConnections: 20,
  connectionTimeout: 30000,
  queryTimeout: 60000
}

export const AUTH_CONFIG = {
  tokenExpiry: '7d',
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000 // 15 minutes
}

export const CHAT_CONFIG = {
  maxMessageLength: 1000,
  maxMessagesPerMinute: 10,
  defaultModel: 'gpt-4o',
  defaultTemperature: 0.7,
  defaultMaxTokens: 500
}

export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadPath: '/uploads'
}

export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later'
}

export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const
