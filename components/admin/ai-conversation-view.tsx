"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Calendar, Clock } from "lucide-react"

interface Message {
  id: number
  user_message: string
  bot_response: string
  timestamp: string
  user_ip: string
}

interface AIConversationViewProps {
  messages: Message[]
}

export default function AIConversationView({ messages }: AIConversationViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "all">("all")

  // Filter messages based on search term and time filter
  const filteredMessages = messages.filter((message) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      message.user_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.bot_response.toLowerCase().includes(searchTerm.toLowerCase())

    // Time filter
    const messageDate = new Date(message.timestamp)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)

    const matchesTime =
      timeFilter === "all" ||
      (timeFilter === "today" && messageDate >= today) ||
      (timeFilter === "week" && messageDate >= weekAgo)

    return matchesSearch && matchesTime
  })

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">💬 مکالمات هوش مصنوعی</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="جستجو در مکالمات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeFilter === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("today")}
                className={timeFilter === "today" ? "bg-blue-600" : ""}
              >
                <Clock className="h-4 w-4 mr-1" />
                امروز
              </Button>
              <Button
                variant={timeFilter === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("week")}
                className={timeFilter === "week" ? "bg-blue-600" : ""}
              >
                <Calendar className="h-4 w-4 mr-1" />
                هفته اخیر
              </Button>
              <Button
                variant={timeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("all")}
                className={timeFilter === "all" ? "bg-blue-600" : ""}
              >
                همه
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleString("fa-IR")} - IP: {message.user_ip || "ناشناس"}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg mb-2">
                    <p className="text-sm font-medium text-blue-900">کاربر:</p>
                    <p className="text-gray-800">{message.user_message}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-900">پاسخ هوش مصنوعی:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{message.bot_response}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">هیچ مکالمه‌ای یافت نشد</h3>
                <p className="text-gray-500">
                  {searchTerm ? "جستجوی شما با هیچ مکالمه‌ای مطابقت ندارد." : "هنوز هیچ مکالمه‌ای ثبت نشده است."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
