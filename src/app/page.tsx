import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatbotService } from '@/services/chatbot.service'
import { checkDatabaseConnection } from '@/lib/db'
import logger from '@/lib/logger'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our Next.js fullstack application',
}

export default async function HomePage() {
  let chatbots = []
  let dbConnected = false

  try {
    dbConnected = await checkDatabaseConnection()
    if (dbConnected) {
      chatbots = await ChatbotService.getAllChatbots()
    }
  } catch (error) {
    logger.error('Error loading homepage data:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-blue-600">NextJS Fullstack</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A complete Next.js 14 application with TypeScript, PostgreSQL, and modern development practices.
            Built for production deployment on cloud platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/chatbots">
                View Chatbots
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/api/health">
                Health Check
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Production Ready
              </CardTitle>
              <CardDescription>
                Optimized for deployment on Liara, Vercel, Railway, and other cloud platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Docker support with Alpine Linux</li>
                <li>• Environment variable management</li>
                <li>• Security headers and best practices</li>
                <li>• Health checks and monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🛠️ Modern Stack
              </CardTitle>
              <CardDescription>
                Built with the latest technologies and development practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Next.js 14 with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• Prisma ORM with PostgreSQL</li>
                <li>• Tailwind CSS for styling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔒 Secure & Scalable
              </CardTitle>
              <CardDescription>
                Enterprise-grade security and performance optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• JWT authentication</li>
                <li>• Input validation with Zod</li>
                <li>• Structured logging with Pino</li>
                <li>• Database connection pooling</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              dbConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {dbConnected ? '✅ Connected' : '❌ Disconnected'}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {chatbots.length}
              </div>
              <div className="text-gray-600">Active Chatbots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dbConnected ? '100%' : '0%'}
              </div>
              <div className="text-gray-600">Database Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                v1.0.0
              </div>
              <div className="text-gray-600">Application Version</div>
            </div>
          </div>
        </div>

        {chatbots.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Recent Chatbots
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.slice(0, 3).map((chatbot) => (
                <Card key={chatbot.id} className="card-hover">
                  <CardHeader>
                    <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                    <CardDescription>
                      {chatbot.welcome_message || 'No welcome message set'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>{chatbot.faqs.length} FAQs</span>
                      <span>{chatbot.products.length} Products</span>
                      <span>{chatbot._count.tickets} Tickets</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/chatbots/${chatbot.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
