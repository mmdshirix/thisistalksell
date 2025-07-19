"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface Ticket {
  id: number
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  created_at: string
  image_url?: string
  admin_response?: string
}

interface UserTicketsViewProps {
  chatbotId: number
  phone: string
  onBack: () => void
}

export default function UserTicketsView({ chatbotId, phone, onBack }: UserTicketsViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [chatbotId, phone])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tickets/user/${encodeURIComponent(phone)}?chatbotId=${chatbotId}`)
      if (!response.ok) throw new Error("Failed to fetch tickets")
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      toast.error("خطا در دریافت تیکت‌ها")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">باز</Badge>
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            در حال بررسی
          </Badge>
        )
      case "closed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">بسته شده</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedTicket) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(selectedTicket.status)}
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedTicket.subject}
              </CardTitle>
            </div>
            <div className="flex items-center justify-between">
              {getStatusBadge(selectedTicket.status)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(selectedTicket.created_at).toLocaleDateString("fa-IR")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">پیام شما:</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{selectedTicket.message}</p>
            </div>

            {selectedTicket.image_url && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">فایل ضمیمه:</h4>
                <img
                  src={selectedTicket.image_url || "/placeholder.svg"}
                  alt="Ticket attachment"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {selectedTicket.admin_response && (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  پاسخ پشتیبانی:
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {selectedTicket.admin_response}
                </p>
              </div>
            )}

            <Button
              onClick={() => setSelectedTicket(null)}
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 rounded-xl h-12 font-medium"
            >
              بازگشت به لیست
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">تیکت‌های شما</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">{tickets.length} تیکت یافت شد</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">هیچ تیکتی یافت نشد</p>
              <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                ارسال تیکت جدید
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 flex-1">
                      {ticket.subject}
                    </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-2">{ticket.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                    </span>
                    {ticket.admin_response && (
                      <Badge variant="secondary" className="text-xs">
                        پاسخ داده شده
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              <Button
                onClick={onBack}
                variant="outline"
                className="w-full border-gray-300 dark:border-gray-600 rounded-xl h-12 font-medium mt-4 bg-transparent"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                بازگشت
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
