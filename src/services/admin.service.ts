import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import logger from '@/lib/logger'
import { z } from 'zod'

export const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const adminCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export interface AdminUser {
  id: number
  username: string
  created_at: Date
  updated_at: Date
}

export class AdminService {
  static async authenticateAdmin(username: string, password: string) {
    try {
      const admin = await prisma.admin_users.findUnique({
        where: { username },
      })

      if (!admin) {
        logger.warn(`Failed login attempt for username: ${username}`)
        throw new Error('Invalid credentials')
      }

      const isValidPassword = await verifyPassword(password, admin.password)
      if (!isValidPassword) {
        logger.warn(`Invalid password for username: ${username}`)
        throw new Error('Invalid credentials')
      }

      const token = generateToken({
        userId: admin.id,
        username: admin.username,
        role: 'admin',
      })

      logger.info(`Successful login for admin: ${username}`)
      
      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          created_at: admin.created_at,
          updated_at: admin.updated_at,
        },
      }
    } catch (error) {
      logger.error('Error authenticating admin:', error)
      throw error
    }
  }

  static async createAdmin(username: string, password: string): Promise<AdminUser> {
    try {
      // Check if admin already exists
      const existingAdmin = await prisma.admin_users.findUnique({
        where: { username },
      })

      if (existingAdmin) {
        throw new Error('Admin user already exists')
      }

      const hashedPassword = await hashPassword(password)
      
      const admin = await prisma.admin_users.create({
        data: {
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          created_at: true,
          updated_at: true,
        },
      })

      logger.info(`Created new admin user: ${username}`)
      return admin
    } catch (error) {
      logger.error('Error creating admin:', error)
      throw error
    }
  }

  static async getAdminById(id: number): Promise<AdminUser | null> {
    try {
      const admin = await prisma.admin_users.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          created_at: true,
          updated_at: true,
        },
      })

      return admin
    } catch (error) {
      logger.error(`Error fetching admin ${id}:`, error)
      throw new Error('Failed to fetch admin')
    }
  }

  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const admins = await prisma.admin_users.findMany({
        select: {
          id: true,
          username: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: { created_at: 'desc' },
      })

      return admins
    } catch (error) {
      logger.error('Error fetching admins:', error)
      throw new Error('Failed to fetch admins')
    }
  }

  static async assignAdminToChatbot(adminId: number, chatbotId: number): Promise<void> {
    try {
      await prisma.admin_users_on_chatbots.create({
        data: {
          admin_user_id: adminId,
          chatbot_id: chatbotId,
        },
      })

      logger.info(`Assigned admin ${adminId} to chatbot ${chatbotId}`)
    } catch (error) {
      logger.error('Error assigning admin to chatbot:', error)
      throw new Error('Failed to assign admin to chatbot')
    }
  }

  static async removeAdminFromChatbot(adminId: number, chatbotId: number): Promise<void> {
    try {
      await prisma.admin_users_on_chatbots.delete({
        where: {
          admin_user_id_chatbot_id: {
            admin_user_id: adminId,
            chatbot_id: chatbotId,
          },
        },
      })

      logger.info(`Removed admin ${adminId} from chatbot ${chatbotId}`)
    } catch (error) {
      logger.error('Error removing admin from chatbot:', error)
      throw new Error('Failed to remove admin from chatbot')
    }
  }

  static async getAdminChatbots(adminId: number) {
    try {
      const adminChatbots = await prisma.admin_users_on_chatbots.findMany({
        where: { admin_user_id: adminId },
        include: {
          chatbot: {
            select: {
              id: true,
              name: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      })

      return adminChatbots.map(ac => ac.chatbot)
    } catch (error) {
      logger.error(`Error fetching chatbots for admin ${adminId}:`, error)
      throw new Error('Failed to fetch admin chatbots')
    }
  }
}
