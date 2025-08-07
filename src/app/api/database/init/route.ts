import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { createApiResponse } from '@/utils/validation'
import logger from '@/lib/logger'

export async function POST() {
  try {
    logger.info('Initializing database...')

    // Check if admin user already exists
    const existingAdmin = await prisma.admin_users.findFirst()
    
    if (existingAdmin) {
      return NextResponse.json(
        createApiResponse(false, null, 'Database already initialized'),
        { status: 409 }
      )
    }

    // Create default admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.admin_users.create({
      data: {
        username: 'admin',
        password: adminPassword,
      },
    })

    // Create sample chatbot
    const chatbot = await prisma.chatbots.create({
      data: {
        name: 'Sample Chatbot',
        welcome_message: 'Welcome to our support chat! How can I help you today?',
        navigation_message: 'Please select an option below:',
        primary_color: '#3B82F6',
        text_color: '#FFFFFF',
        background_color: '#F3F4F6',
        position: 'bottom-right',
        stats_multiplier: 1.0,
      },
    })

    // Create sample FAQs
    await prisma.faqs.createMany({
      data: [
        {
          chatbot_id: chatbot.id,
          question: 'What are your business hours?',
          answer: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
          emoji: '🕒',
        },
        {
          chatbot_id: chatbot.id,
          question: 'How can I contact support?',
          answer: 'You can contact us through this chat, email, or phone.',
          emoji: '📞',
        },
        {
          chatbot_id: chatbot.id,
          question: 'Do you offer refunds?',
          answer: 'Yes, we offer a 30-day money-back guarantee.',
          emoji: '💰',
        },
      ],
    })

    // Create sample products
    await prisma.products.createMany({
      data: [
        {
          chatbot_id: chatbot.id,
          name: 'Premium Plan',
          description: 'Our most popular plan with all features included',
          price: 29.99,
          button_text: 'Get Started',
        },
        {
          chatbot_id: chatbot.id,
          name: 'Basic Plan',
          description: 'Perfect for small businesses and startups',
          price: 9.99,
          button_text: 'Choose Basic',
        },
      ],
    })

    // Assign admin to chatbot
    await prisma.admin_users_on_chatbots.create({
      data: {
        admin_user_id: admin.id,
        chatbot_id: chatbot.id,
      },
    })

    const result = {
      admin: {
        id: admin.id,
        username: admin.username,
      },
      chatbot: {
        id: chatbot.id,
        name: chatbot.name,
      },
      message: 'Database initialized successfully',
    }

    logger.info('Database initialization completed', result)

    return NextResponse.json(
      createApiResponse(true, result, 'Database initialized successfully'),
      { status: 201 }
    )
  } catch (error) {
    logger.error('Database initialization failed:', error)
    
    return NextResponse.json(
      createApiResponse(false, null, 'Database initialization failed', [
        error instanceof Error ? error.message : 'Unknown error'
      ]),
      { status: 500 }
    )
  }
}
