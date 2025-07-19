"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MessageSquare, Phone, User, Mail, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Ticket {
  id: number
  name: string
  email: string
  user_phone: string
  subject: string
  message: string
  status: string
  priority: string
  image_url?: string
  created_at: string
  updated_at: string
}

interface UserTicketsViewProps {
  chatbotId: number
  phone: string
  onBack: () => void
}

export default function UserTicketsView({ chatbotId, phone, onBack }: UserTicketsViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserTickets()
  }, [chatbotId, phone])

  const fetchUserTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}?chatbotId=${chatbotId}`)

      if (!response.ok) {
        throw new Error("خطا در دریافت تیکت‌ها")
      }

      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت تیکت‌ها")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "باز"
      case "closed":
        return "بسته"
      case "pending":
        return "در انتظار"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
      case "closed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      case "pending":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      case "normal":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "بالا"
      case "normal":
        return "متوسط"
      case "low":
        return "کم"
      default:
        return priority
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">خطا در دریافت تیکت‌ها</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUserTickets} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                تلاش مجدد
              </Button>
              <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
                بازگشت
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              تیکت‌های شما
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">
                {phone}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">هیچ تیکتی یافت نشد</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">شما هنوز هیچ تیکتی ارسال نکرده‌اید</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white">
              ارسال تیکت جدید
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(ticket.status)}
                        {getStatusLabel(ticket.status)}
                      </div>
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {ticket.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{ticket.name}</span>
                    </div>
                  )}
                  {ticket.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300" dir="ltr">
                        {ticket.email}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{ticket.message}</p>
                </div>

                {ticket.image_url && (
                  <div className="mt-3">
                    <img
                      src={ticket.image_url || "/placeholder.svg"}
                      alt="ضمیمه تیکت"
                      className="max-w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
