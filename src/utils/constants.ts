export const APP_CONFIG = {
  name: 'NextJS Fullstack App',
  version: '1.0.0',
  description: 'A complete Next.js application with PostgreSQL',
  author: 'Your Name',
  repository: 'https://github.com/yourusername/nextjs-fullstack-app',
} as const

export const API_ROUTES = {
  // Auth routes
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/profile',
  
  // Chatbot routes
  CHATBOTS: '/api/chatbots',
  CHATBOT_BY_ID: (id: number) => `/api/chatbots/${id}`,
  CHATBOT_STATS: (id: number) => `/api/chatbots/${id}/stats`,
  
  // Admin routes
  ADMIN_LOGIN: (id: number) => `/api/admin-panel/${id}/login`,
  ADMIN_LOGOUT: (id: number) => `/api/admin-panel/${id}/logout`,
  ADMIN_DATA: (id: number) => `/api/admin-panel/${id}/data`,
  
  // Health check
  HEALTH: '/api/health',
  
  // Database
  DB_TEST: '/api/database/test',
  DB_INIT: '/api/database/init',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export const ERROR_MESSAGES = {
  INVALID_REQUEST: 'Invalid request data',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  VALIDATION_ERROR: 'Validation failed',
} as const

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

export const CACHE_KEYS = {
  CHATBOTS: 'chatbots',
  CHATBOT: (id: number) => `chatbot:${id}`,
  ADMIN: (id: number) => `admin:${id}`,
  STATS: (id: number) => `stats:${id}`,
} as const

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-$$$$]+$/,
  URL: /^https?:\/\/.+/,
  HEX_COLOR: /^#[0-9A-F]{6}$/i,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
  },
} as const
