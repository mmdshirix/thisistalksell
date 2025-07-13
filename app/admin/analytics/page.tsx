"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Clock, TrendingUp, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalyticsData {
  totalMessages: number
  totalUsers: number
  averageResponseTime: number
  satisfactionRate: number
  dailyStats: Array<{
    date: string
    messages: number
    users: number
  }>
  topQuestions: Array<{
    question: string
    count: number
    percentage: number
  }>
  hourlyActivity: Array<{
    hour: number
    messages: number
  }>
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<AnalyticsData>({
    totalMessages: 1247,
    totalUsers: 342,
    averageResponseTime: 2.3,
    satisfactionRate: 94.2,
    dailyStats: [
      { date: "2024-01-15", messages: 156, users: 45 },
      { date: "2024-01-16", messages: 189, users: 52 },
      { date: "2024-01-17", messages: 234, users: 67 },
      { date: "2024-01-18", messages: 198, users: 58 },
      { date: "2024-01-19", messages: 267, users: 73 },
      { date: "2024-01-20", messages: 203, users: 61 },
      { date: "2024-01-21", messages: 178, users: 49 },
    ],
    topQuestions: [
      { question: "محصولات موجود", count: 234, percentage: 18.8 },
      { question: "نحوه سفارش", count: 189, percentage: 15.2 },
      { question: "گارانتی و خدمات", count: 156, percentage: 12.5 },
      { question: "ارسال و تحویل", count: 134, percentage: 10.7 },
      { question: "پشتیبانی", count: 98, percentage: 7.9 },
    ],
    hourlyActivity: [
      { hour: 0, messages: 12 },
      { hour: 1, messages: 8 },
      { hour: 2, messages: 5 },
      { hour: 3, messages: 3 },
      { hour: 4, messages: 7 },
      { hour: 5, messages: 15 },
      { hour: 6, messages: 28 },
      { hour: 7, messages: 45 },
      { hour: 8, messages: 67 },
      { hour: 9, messages: 89 },
      { hour: 10, messages: 95 },
      { hour: 11, messages: 87 },
      { hour: 12, messages: 92 },
      { hour: 13, messages: 78 },
      { hour: 14, messages: 85 },
      { hour: 15, messages: 91 },
      { hour: 16, messages: 88 },
      { hour: 17, messages: 76 },
      { hour: 18, messages: 69 },
      { hour: 19, messages: 54 },
      { hour: 20, messages: 43 },
      { hour: 21, messages: 32 },
      { hour: 22, messages: 25 },
      { hour: 23, messages: 18 },
    ],
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleExport = () => {
    // Simulate export functionality
    alert("گزارش در حال دانلود است...")
  }

  const maxHourlyMessages = Math.max(...data.hourlyActivity.map((h) => h.messages))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">آمار و گزارشات</h1>
        <div className="flex gap-3">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            className="border-blue-200 focus:border-blue-500 shadow-md"
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24 ساعت گذشته</SelectItem>
              <SelectItem value="7d">7 روز گذشته</SelectItem>
              <SelectItem value="30d">30 روز گذشته</SelectItem>
              <SelectItem value="90d">3 ماه گذشته</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg"
          >
            <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            بروزرسانی
          </Button>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
          >
            <Download className="ml-2 h-4 w-4" />
            دانلود گزارش
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل پیام‌ها</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMessages.toLocaleString("fa-IR")}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> نسبت به دوره قبل
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کاربران فعال</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers.toLocaleString("fa-IR")}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> نسبت به دوره قبل
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">زمان پاسخ متوسط</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageResponseTime} ثانیه</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-5%</span> نسبت به دوره قبل
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رضایت کاربران</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{data.satisfactionRate}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> نسبت به دوره قبل
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>فعالیت روزانه</CardTitle>
            <CardDescription>تعداد پیام‌ها و کاربران در 7 روز گذشته</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.dailyStats.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm">
                    {new Date(day.date).toLocaleDateString("fa-IR", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">{day.messages} پیام</div>
                    <div className="text-sm text-gray-600">{day.users} کاربر</div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                        style={{ width: `${(day.messages / 300) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>پرسش‌های پرتکرار</CardTitle>
            <CardDescription>سوالاتی که بیشترین تعداد را دارند</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topQuestions.map((question, index) => (
                <div key={question.question} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="hover:bg-blue-100 transition-colors">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{question.question}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{question.count}</span>
                    <span className="text-sm text-gray-500">%{question.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>فعالیت ساعتی</CardTitle>
          <CardDescription>توزیع پیام‌ها در طول شبانه‌روز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-24 gap-1 h-32">
            {data.hourlyActivity.map((hour) => (
              <div key={hour.hour} className="flex flex-col items-center justify-end">
                <div
                  className="bg-gradient-to-t from-blue-500 to-indigo-500 w-full rounded-t"
                  style={{ height: `${(hour.messages / maxHourlyMessages) * 100}%` }}
                  title={`ساعت ${hour.hour}: ${hour.messages} پیام`}
                />
                <div className="text-xs text-gray-500 mt-1">{hour.hour}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
