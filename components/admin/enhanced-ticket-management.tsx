"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

interface Ticket {
  id: number
  subject: string
  message: string
  status: "open" | "in_progress" | "closed"
  priority: "low" | "medium" | "high"
  created_at: string
  user_phone: string
  image_url?: string
}

interface TicketResponse {
  id: number
  response: string
  created_at: string
  is_admin_response: boolean
}

interface EnhancedTicketManagementProps {
  chatbotId: string
}

export default function EnhancedTicketManagement({ chatbotId }: EnhancedTicketManagementProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [sendingResponse, setSendingResponse] = useState(false)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/chatbot/${chatbotId}`)
      if (!res.ok) throw new Error("Failed to fetch tickets")
      const data = await res.json()
      setTickets(data)
    } catch (error) {
      toast.error("خطا در دریافت لیست تیکت‌ها")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (chatbotId) {
      fetchTickets()
    }
  }, [chatbotId])

  useEffect(() => {
    if (selectedTicket) {
      const fetchResponses = async () => {
        setLoadingResponses(true)
        try {
          const res = await fetch(`/api/tickets/${selectedTicket.id}/responses`)
          if (!res.ok) throw new Error("Failed to fetch responses")
          const data = await res.json()
          setResponses(data)
        } catch (error) {
          toast.error("خطا در دریافت پاسخ‌های تیکت")
          console.error(error)
        } finally {
          setLoadingResponses(false)
        }
      }
      fetchResponses()
    } else {
      setResponses([])
    }
  }, [selectedTicket])

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return
    setSendingResponse(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: newResponse, isAdminResponse: true }),
      })
      if (!res.ok) throw new Error("Failed to send response")
      const newResponseData = await res.json()
      setResponses((prev) => [...prev, newResponseData])
      setNewResponse("")
      toast.success("پاسخ با موفقیت ارسال شد")
    } catch (error) {
      toast.error("خطا در ارسال پاسخ")
      console.error(error)
    } finally {
      setSendingResponse(false)
    }
  }

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: status as Ticket["status"] } : t)))
      toast.success("وضعیت تیکت با موفقیت به‌روزرسانی شد")
    } catch (error) {
      toast.error("خطا در به‌روزرسانی وضعیت")
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">باز</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500 text-white">در حال بررسی</Badge>
      case "closed":
        return <Badge variant="secondary">بسته شده</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>لیست تیکت‌ها</CardTitle>
          <CardDescription>{tickets.length} تیکت یافت شد</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`cursor-pointer rounded-lg border-l-4 p-3 ${
                  selectedTicket?.id === ticket.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-transparent hover:bg-gray-50"
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold">{ticket.subject}</p>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString("fa-IR")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>جزئیات تیکت</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTicket ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">{selectedTicket.subject}</h3>
                <Select
                  value={selectedTicket.status}
                  onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="تغییر وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">باز</SelectItem>
                    <SelectItem value="in_progress">در حال بررسی</SelectItem>
                    <SelectItem value="closed">بسته شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="mb-4 text-gray-600">{selectedTicket.message}</p>
              {selectedTicket.image_url && (
                <div className="mb-4">
                  <a href={selectedTicket.image_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedTicket.image_url || "/placeholder.svg"}
                      alt="Ticket attachment"
                      className="max-w-xs rounded-lg"
                    />
                  </a>
                </div>
              )}
              <hr className="my-4" />
              <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
                {loadingResponses ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  responses.map((res) => (
                    <div
                      key={res.id}
                      className={`rounded-lg p-3 ${res.is_admin_response ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                      <p>{res.response}</p>
                      <p className="mt-1 text-left text-xs text-gray-500">
                        {new Date(res.created_at).toLocaleString("fa-IR")}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 space-y-2">
                <Textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="پاسخ خود را اینجا بنویسید..."
                />
                <Button onClick={handleSendResponse} disabled={sendingResponse} className="w-full">
                  {sendingResponse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="mr-2">ارسال پاسخ</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500">
              <p>برای مشاهده جزئیات، یک تیکت را از لیست انتخاب کنید.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
