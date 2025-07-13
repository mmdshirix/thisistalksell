"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { fa } from "date-fns/locale"

interface Message {
  id: number
  user_message: string
  ai_response: string
  created_at: string
  user_ip?: string
}

interface MessageTimelineProps {
  messages: Message[]
  className?: string
}

export default function MessageTimeline({ messages, className }: MessageTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💬 تایم‌لاین پیام‌ها
          <Badge variant="secondary">{messages.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>هنوز پیامی دریافت نشده است</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id} className="relative">
                  {index !== messages.length - 1 && (
                    <div className="absolute right-4 top-12 w-0.5 h-full bg-gradient-to-b from-blue-200 to-transparent" />
                  )}

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* User Message */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border-r-4 border-blue-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">👤 کاربر</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: fa,
                            })}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">{message.user_message}</p>
                        {message.user_ip && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              IP: {message.user_ip}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* AI Response */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4 border-r-4 border-green-500 mr-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-600">🤖 هوش مصنوعی</span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed">{message.ai_response}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
