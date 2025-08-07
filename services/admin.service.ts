import { getSql } from '@/lib/db'
import { hashPassword, comparePassword } from '@/lib/auth'
import logger from '@/lib/logger'

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  chatbot_id: string
  role: string
  created_at: Date
  updated_at: Date
}

export class AdminService {
  private sql = getSql()

  async authenticateAdmin(chatbotId: string, username: string, password: string): Promise<AdminUser | null> {
    try {
      const admins = await this.sql`
        SELECT * FROM admin_users 
        WHERE chatbot_id = ${chatbotId} AND username = ${username}
      `
      
      if (admins.length === 0) {
        return null
      }

      const admin = admins[0] as AdminUser
      const isValidPassword = await comparePassword(password, admin.password_hash)
      
      if (!isValidPassword) {
        return null
      }

      return admin
    } catch (error) {
      logger.error('Error authenticating admin:', error)
      return null
    }
  }

  async createAdmin(chatbotId: string, username: string, password: string, role: string = 'admin'): Promise<AdminUser> {
    try {
      const passwordHash = await hashPassword(password)
      
      const admins = await this.sql`
        INSERT INTO admin_users (chatbot_id, username, password_hash, role)
        VALUES (${chatbotId}, ${username}, ${passwordHash}, ${role})
        RETURNING *
      `
      
      return admins[0] as AdminUser
    } catch (error) {
      logger.error('Error creating admin:', error)
      throw new Error('Failed to create admin user')
    }
  }

  async getAdminsByChatbot(chatbotId: string): Promise<AdminUser[]> {
    try {
      const admins = await this.sql`
        SELECT id, username, chatbot_id, role, created_at, updated_at 
        FROM admin_users 
        WHERE chatbot_id = ${chatbotId}
        ORDER BY created_at DESC
      `
      
      return admins as AdminUser[]
    } catch (error) {
      logger.error('Error fetching admins:', error)
      throw new Error('Failed to fetch admin users')
    }
  }

  async deleteAdmin(id: string): Promise<boolean> {
    try {
      await this.sql`DELETE FROM admin_users WHERE id = ${id}`
      return true
    } catch (error) {
      logger.error('Error deleting admin:', error)
      throw new Error('Failed to delete admin user')
    }
  }
}
