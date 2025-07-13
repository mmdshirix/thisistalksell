import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getChatbotById,
  getMessageCountByDay,
  getMessageCountByWeek,
  getMessageCountByMonth,
  getTopUserQuestions,
  getTotalMessageCount,
  getUniqueUsersCount,
  getAverageMessagesPerUser,
} from "@/lib/db"
import MessageCountChart from "@/components/analytics/message-count-chart"
import TopQuestionsList from "@/components/analytics/top-questions-list"

interface AnalyticsPageProps {
  params: {
    id: string
  }
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const chatbotId = Number.parseInt(params.id)

  if (isNaN(chatbotId)) {
    notFound()
  }

  const chatbot = await getChatbotById(chatbotId)

  if (!chatbot) {
    notFound()
  }

  const dailyData = await getMessageCountByDay(chatbotId)
  const weeklyData = await getMessageCountByWeek(chatbotId)
  const monthlyData = await getMessageCountByMonth(chatbotId)
  const topQuestions = await getTopUserQuestions(chatbotId)

  const totalMessages = await getTotalMessageCount(chatbotId)
  const uniqueUsers = await getUniqueUsersCount(chatbotId)
  const avgMessagesPerUser = await getAverageMessagesPerUser(chatbotId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center">
          <Link href={`/chatbots/${chatbot.id}`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics: {chatbot.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages}</div>
              <p className="text-xs text-muted-foreground">All time message count</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Based on unique IP addresses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Messages/User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMessagesPerUser}</div>
              <p className="text-xs text-muted-foreground">Average conversation length</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MessageCountChart dailyData={dailyData} weeklyData={weeklyData} monthlyData={monthlyData} />
          <TopQuestionsList questions={topQuestions} />
        </div>
      </main>
    </div>
  )
}
