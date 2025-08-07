import { z } from 'zod'

export const idSchema = z.object({
  id: z.string().transform((val) => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num <= 0) {
      throw new Error('Invalid ID')
    }
    return num
  }),
})

export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => {
    if (!val) return 1
    const num = parseInt(val, 10)
    return isNaN(num) || num < 1 ? 1 : num
  }),
  limit: z.string().optional().transform((val) => {
    if (!val) return 10
    const num = parseInt(val, 10)
    return isNaN(num) || num < 1 || num > 100 ? 10 : num
  }),
})

export const searchSchema = z.object({
  q: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
  sortBy: z.string().optional().default('created_at'),
})

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Validation failed: ${messages.join(', ')}`)
    }
    throw error
  }
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  errors?: string[]
) {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors: string[] = []) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}
