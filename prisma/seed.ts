import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'
import logger from '../src/lib/logger'

const prisma = new PrismaClient()

async function main() {
  logger.info('Starting database seed...')

  try {
    // Create admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.admin_users.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
      },
    })
    logger.info(`Created admin user: ${admin.username}`)

    // Create sample chatbot
    const chatbot = await prisma.chatbots.upsert({
      where: { id: 1 },
      update: {},
      create: {
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
    logger.info(`Created sample chatbot: ${chatbot.name}`)

    // Create sample FAQs
    const faqs = [
      {
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
        emoji: '🕒',
      },
      {
        question: 'How can I contact support?',
        answer: 'You can contact us through this chat, email, or phone.',
        emoji: '📞',
      },
      {
        question: 'Do you offer refunds?',
        answer: 'Yes, we offer a 30-day money-back guarantee.',
        emoji: '💰',
      },
    ]

    for (const faq of faqs) {
      await prisma.faqs.upsert({
        where: { 
          id: faqs.indexOf(faq) + 1 
        },
        update: {},
        create: {
          ...faq,
          chatbot_id: chatbot.id,
        },
      })
    }
    logger.info(`Created ${faqs.length} sample FAQs`)

    // Create sample products
    const products = [
      {
        name: 'Premium Plan',
        description: 'Our most popular plan with all features included',
        price: 29.99,
        button_text: 'Get Started',
      },
      {
        name: 'Basic Plan',
        description: 'Perfect for small businesses and startups',
        price: 9.99,
        button_text: 'Choose Basic',
      },
      {
        name: 'Enterprise Plan',
        description: 'Advanced features for large organizations',
        price: 99.99,
        button_text: 'Contact Sales',
      },
    ]

    for (const product of products) {
      await prisma.products.upsert({
        where: { 
          id: products.indexOf(product) + 1 
        },
        update: {},
        create: {
          ...product,
          chatbot_id: chatbot.id,
        },
      })
    }
    logger.info(`Created ${products.length} sample products`)

    // Assign admin to chatbot
    await prisma.admin_users_on_chatbots.upsert({
      where: {
        admin_user_id_chatbot_id: {
          admin_user_id: admin.id,
          chatbot_id: chatbot.id,
        },
      },
      update: {},
      create: {
        admin_user_id: admin.id,
        chatbot_id: chatbot.id,
      },
    })
    logger.info('Assigned admin to sample chatbot')

    logger.info('Database seed completed successfully!')
  } catch (error) {
    logger.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    logger.error('Seed script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
