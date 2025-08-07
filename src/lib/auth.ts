import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import logger from './logger'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface TokenPayload {
  userId: number
  username: string
  role?: string
  iat?: number
  exp?: number
}

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    logger.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    logger.error('Error verifying password:', error)
    return false
  }
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'nextjs-app',
      audience: 'nextjs-app-users',
    })
  } catch (error) {
    logger.error('Error generating token:', error)
    throw new Error('Failed to generate token')
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'nextjs-app',
      audience: 'nextjs-app-users',
    }) as TokenPayload
    
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token')
    } else {
      logger.error('Error verifying token:', error)
    }
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export function generateRefreshToken(): string {
  return jwt.sign(
    { type: 'refresh', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export function requireAuth(token: string | null): TokenPayload {
  if (!token) {
    throw new AuthError('Authentication required', 401)
  }

  const payload = verifyToken(token)
  if (!payload) {
    throw new AuthError('Invalid or expired token', 401)
  }

  return payload
}
