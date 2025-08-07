import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample chatbot
  const chatbot = await prisma.chatbot.create({
    data: {
      name: 'Sample Support Bot',
      description: 'A helpful customer support chatbot',
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 500,
      show_product_suggestions: true,
      show_faq_suggestions: true,
      show_quick_options: true,
      show_ticket_form: true,
    },
  })

  console.log('✅ Created chatbot:', chatbot.name)

  // Create sample FAQs
  const faqs = await Promise.all([
    prisma.fAQ.create({
      data: {
        chatbot_id: chatbot.id,
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
        position: 1,
      },
    }),
    prisma.fAQ.create({
      data: {
        chatbot_id: chatbot.id,
        question: 'How can I contact support?',
        answer: 'You can contact us through this chat, email at support@company.com, or call (555) 123-4567.',
        position: 2,
      },
    }),
    prisma.fAQ.create({
      data: {
        chatbot_id: chatbot.id,
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all unused items in original packaging.',
        position: 3,
      },
    }),
  ])

  console.log('✅ Created', faqs.length, 'FAQs')

  // Create sample products
  const products = await Promise.all([
    prisma.suggestedProduct.create({
      data: {
        chatbot_id: chatbot.id,
        name: 'Premium Support Plan',
        description: 'Get priority support with 24/7 availability and dedicated account manager.',
        position: 1,
      },
    }),
    prisma.suggestedProduct.create({
      data: {
        chatbot_id: chatbot.id,
        name: 'Basic Support Plan',
        description: 'Essential support during business hours with email and chat support.',
        position: 2,
      },
    }),
    prisma.suggestedProduct.create({
      data: {
        chatbot_id: chatbot.id,
        name: 'Enterprise Solution',
        description: 'Complete enterprise package with custom integrations and dedicated support.',
        position: 3,
      },
    }),
  ])

  console.log('✅ Created', products.length, 'products')

  // Create sample quick options
  const quickOptions = await Promise.all([
    prisma.quickOption.create({
      data: {
        chatbot_id: chatbot.id,
        text: 'Check order status',
        position: 1,
      },
    }),
    prisma.quickOption.create({
      data: {
        chatbot_id: chatbot.id,
        text: 'Billing questions',
        position: 2,
      },
    }),
    prisma.quickOption.create({
      data: {
        chatbot_id: chatbot.id,
        text: 'Technical support',
        position: 3,
      },
    }),
  ])

  console.log('✅ Created', quickOptions.length, 'quick options')

  // Create admin user
  const passwordHash = await hashPassword('admin123')
  const adminUser = await prisma.adminUser.create({
    data: {
      chatbot_id: chatbot.id,
      username: 'admin',
      password_hash: passwordHash,
      role: 'admin',
    },
  })

  console.log('✅ Created admin user:', adminUser.username)

  // Create sample messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        chatbot_id: chatbot.id,
        user_message: 'Hello, I need help with my order',
        bot_response: 'Hi! I\'d be happy to help you with your order. Could you please provide your order number?',
      },
    }),
    prisma.message.create({
      data: {
        chatbot_id: chatbot.id,
        user_message: 'What are your business hours?',
        bot_response: 'We are open Monday to Friday, 9 AM to 6 PM EST. How can I assist you today?',
      },
    }),
  ])

  console.log('✅ Created', messages.length, 'sample messages')

  console.log('🎉 Database seeded successfully!')
  console.log('📋 Sample data created:')
  console.log(`   - Chatbot ID: ${chatbot.id}`)
  console.log(`   - Admin username: admin`)
  console.log(`   - Admin password: admin123`)
  console.log(`   - FAQs: ${faqs.length}`)
  console.log(`   - Products: ${products.length}`)
  console.log(`   - Quick options: ${quickOptions.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
