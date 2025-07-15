"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  RefreshCw,
  LogOut,
  BarChart3,
  Ticket,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Palette,
  LifeBuoy,
  Save,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import LivePreview from "@/components/admin/live-preview"

// Interfaces
interface AdminPanelData {
  chatbot: { id: number; name: string; primary_color: string }
  stats: {
    totalMessages: number
    periodMessages: number
    uniqueUsers: number
    period: string
    dailyStats: Array<{ date: string; messages: number; users: number }>
    hourlyActivity: Array<{ hour: number; messages: number }>
    topQuestions: Array<{ question: string; count: number }>
  }
  tickets: {
    tickets: Array<any>
    statusCounts: { [key: string]: number }
    totalTickets: number
  }
}
interface TicketResponse {
  id: number
  message: string
  is_admin: boolean
  created_at: string
}

export default function AdminPanelPage() {
  const params = useParams()
  const router = useRouter()
  const chatbotId = params.id as string

  const [data, setData] = useState<AdminPanelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [submittingResponse, setSubmittingResponse] = useState(false)
  const [statsPeriod, setStatsPeriod] = useState("all")
  const [ticketStatus, setTicketStatus] = useState("all")
  const [ticketSort, setTicketSort] = useState("newest")

  // Appearance State
  const [appearance, setAppearance] = useState({ name: "", primary_color: "#000000" })
  const [isSavingAppearance, setIsSavingAppearance] = useState(false)

  // Helper to safely parse JSON
  /**
   * Safely parse a Response assuming JSON.
   * If the payload is HTML (e.g. an auth redirect / error page) we:
   *   • Optionally redirect to login on 401 / 403
   *   • Show a toast
   *   • Throw a descriptive error so fetchData's catch handles it.
   */
  const safeJson = async (res: Response, label: string) => {
    const type = res.headers.get("content-type") || ""

    // --- happy path ---------------------------------------------------------
    if (type.includes("application/json")) return res.json()

    // --- non-JSON => usually an HTML error page -----------------------------
    const htmlSnippet = (await res.text()).slice(0, 180)
    const msg = `Endpoint «${label}» did not return JSON.\nStatus: ${res.status}\nSnippet: ${htmlSnippet}`

    // If we hit auth errors, bounce to login immediately
    if (res.status === 401 || res.status === 403) {
      toast.error("نشست منقضی شده، لطفاً دوباره وارد شوید.")
      router.push(`/admin-panel/${chatbotId}/login`)
      throw new Error("Unauthorized – redirected to login")
    }

    // For anything else, surface a concise toast and error
    toast.error("خطا در دریافت اطلاعات (فرمت غیر معتبر)")
    throw new Error(msg)
  }

  const fetchData = useCallback(async () => {
    if (!loading) setIsRefreshing(true)
    try {
      const [statsRes, ticketsRes, chatbotRes] = await Promise.all([
        fetch(`/api/admin-panel/${chatbotId}/stats?period=${statsPeriod}`),
        fetch(`/api/admin-panel/${chatbotId}/tickets?status=${ticketStatus}&sortBy=${ticketSort}`),
        fetch(`/api/chatbots/${chatbotId}`),
      ])

      // Check status first
      if (!statsRes.ok || !ticketsRes.ok || !chatbotRes.ok) {
        toast.error("خطای سرور در دریافت داده‌ها")
        throw new Error(
          `Server error codes — stats:${statsRes.status}, tickets:${ticketsRes.status}, chatbot:${chatbotRes.status}`,
        )
      }

      // Safely parse JSON (prevents HTML error pages from crashing parsing)
      const [statsData, ticketsData, chatbotData] = await Promise.all([
        safeJson(statsRes, "stats"),
        safeJson(ticketsRes, "tickets"),
        safeJson(chatbotRes, "chatbot"),
      ])

      setData({ chatbot: chatbotData, stats: statsData, tickets: ticketsData })
      setAppearance({ name: chatbotData.name, primary_color: chatbotData.primary_color })
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("خطا در دریافت اطلاعات")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [chatbotId, statsPeriod, ticketStatus, ticketSort, loading, router])

  const fetchTicketDetails = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/responses`)
      if (response.ok) setTicketResponses(await response.json())
    } catch (error) {
      console.error("Error fetching ticket details:", error)
    }
  }

  const handleTicketSelect = (ticket: any) => {
    setSelectedTicket(ticket)
    fetchTicketDetails(ticket.id)
  }

  const handleResponseSubmit = async () => {
    if (!selectedTicket || !newResponse.trim()) return
    setSubmittingResponse(true)
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newResponse, is_admin: true }),
      })
      if (response.ok) {
        setNewResponse("")
        fetchTicketDetails(selectedTicket.id)
        toast.success("پاسخ با موفقیت ارسال شد")
      }
    } catch (error) {
      toast.error("خطا در ارسال پاسخ")
    } finally {
      setSubmittingResponse(false)
    }
  }

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchData()
        if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status })
        toast.success("وضعیت تیکت بروزرسانی شد")
      }
    } catch (error) {
      toast.error("خطا در بروزرسانی وضعیت")
    }
  }

  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true)
    toast.loading("در حال ذخیره تنظیمات...")
    try {
      const res = await fetch(`/api/admin-panel/${chatbotId}/appearance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appearance),
      })
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || "خطا در ذخیره")
      toast.success(resData.message)
      await fetchData() // Refresh data to show new name/color
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
    } finally {
      setIsSavingAppearance(false)
    }
  }

  const handleLogout = async () => {
    await fetch(`/api/admin-panel/${chatbotId}/logout`, { method: "POST" })
    router.push(`/admin-panel/${chatbotId}/login`)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      open: { label: "باز", color: "bg-red-100 text-red-800", icon: AlertCircle },
      in_progress: { label: "در حال بررسی", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      resolved: { label: "حل شده", color: "bg-green-100 text-green-800", icon: CheckCircle },
      closed: { label: "بسته", color: "bg-gray-100 text-gray-800", icon: XCircle },
    }[status] || { label: "نامشخص", color: "bg-gray-100", icon: AlertCircle }
    const Icon = config.icon
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">خطا در بارگذاری اطلاعات</div>
  }

  const maxDailyMessages = Math.max(...data.stats.dailyStats.map((d) => d.messages), 1)
  const maxHourlyMessages = Math.max(...data.stats.hourlyActivity.map((h) => h.messages), 1)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">پنل مدیریت: {data.chatbot.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchData} disabled={isRefreshing}>
              <RefreshCw className={`ml-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              بروزرسانی
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="stats">
              <BarChart3 className="ml-2 h-4 w-4" />
              آمار
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="ml-2 h-4 w-4" />
              تیکت‌ها
              {data.tickets.statusCounts.open > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {data.tickets.statusCounts.open}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="ml-2 h-4 w-4" />
              ظاهر
            </TabsTrigger>
            <TabsTrigger value="preview">
              <LifeBuoy className="ml-2 h-4 w-4" />
              پیش‌نمایش
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <Select value={statsPeriod} onValueChange={setStatsPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">کل آمار</SelectItem>
                <SelectItem value="month">ماه اخیر</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">تعداد پیام‌ها</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.periodMessages.toLocaleString("fa-IR")}</div>
                  <p className="text-xs text-muted-foreground">
                    {statsPeriod === "month"
                      ? `از کل ${data.stats.totalMessages.toLocaleString("fa-IR")}`
                      : "کل پیام‌ها"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">کاربران منحصر به فرد</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.stats.uniqueUsers.toLocaleString("fa-IR")}</div>
                  <p className="text-xs text-muted-foreground">
                    {statsPeriod === "month" ? "در ماه اخیر" : "کل کاربران"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">میانگین پیام</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.uniqueUsers > 0 ? (data.stats.periodMessages / data.stats.uniqueUsers).toFixed(1) : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">پیام به ازای هر کاربر</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>فعالیت روزانه (30 روز اخیر)</CardTitle>
                  <CardDescription>تعداد پیام‌ها و کاربران در هر روز</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.stats.dailyStats.slice(0, 10).map((day, index) => (
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
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(day.messages / maxDailyMessages) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>فعالیت ساعتی (امروز)</CardTitle>
                  <CardDescription>توزیع پیام‌ها در طول روز</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-1 h-32">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const activity = data.stats.hourlyActivity.find((h) => h.hour === hour)
                      const messages = activity?.messages || 0
                      return (
                        <div key={hour} className="flex flex-col items-center justify-end">
                          <div
                            className="bg-blue-500 w-full rounded-t"
                            style={{ height: `${maxHourlyMessages > 0 ? (messages / maxHourlyMessages) * 100 : 0}%` }}
                            title={`ساعت ${hour}: ${messages} پیام`}
                          />
                          <div className="text-xs text-gray-500 mt-1">{hour}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Questions */}
            <Card>
              <CardHeader>
                <CardTitle>پرسش‌های پرتکرار</CardTitle>
                <CardDescription>{statsPeriod === "month" ? "در ماه اخیر" : "از ابتدا"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.stats.topQuestions.slice(0, 8).map((question, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm">{question.question}</span>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{question.count} بار</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tickets List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        تیکت‌ها
                      </CardTitle>
                      <Badge variant="secondary">{data.tickets.totalTickets}</Badge>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3">
                      <Select value={ticketStatus} onValueChange={setTicketStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="فیلتر وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                          <SelectItem value="open">باز ({data.tickets.statusCounts.open || 0})</SelectItem>
                          <SelectItem value="in_progress">
                            در حال بررسی ({data.tickets.statusCounts.in_progress || 0})
                          </SelectItem>
                          <SelectItem value="resolved">حل شده ({data.tickets.statusCounts.resolved || 0})</SelectItem>
                          <SelectItem value="closed">بسته ({data.tickets.statusCounts.closed || 0})</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={ticketSort} onValueChange={setTicketSort}>
                        <SelectTrigger>
                          <SelectValue placeholder="مرتب‌سازی" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">جدیدترین</SelectItem>
                          <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                          <SelectItem value="priority">اولویت</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-3">
                        {data.tickets.tickets.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Ticket className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>تیکتی یافت نشد</p>
                          </div>
                        ) : (
                          data.tickets.tickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                selectedTicket?.id === ticket.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleTicketSelect(ticket)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm truncate flex-1">{ticket.subject}</h4>
                                {getStatusBadge(ticket.status)}
                              </div>

                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.message}</p>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">نام:</span>
                                  <span>{ticket.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">ایمیل:</span>
                                  <span>{ticket.email}</span>
                                </div>
                                {ticket.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">تلفن:</span>
                                    <span>{ticket.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Ticket Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {selectedTicket ? "جزئیات تیکت" : "انتخاب تیکت"}
                      </CardTitle>
                      {selectedTicket && (
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">باز</SelectItem>
                            <SelectItem value="in_progress">در حال بررسی</SelectItem>
                            <SelectItem value="resolved">حل شده</SelectItem>
                            <SelectItem value="closed">بسته</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedTicket ? (
                      <div className="space-y-6">
                        {/* Ticket Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-3">{selectedTicket.subject}</h3>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">نام:</span>
                              <span>{selectedTicket.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">ایمیل:</span>
                              <span>{selectedTicket.email}</span>
                            </div>
                            {selectedTicket.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">تلفن:</span>
                                <span>{selectedTicket.phone}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 mb-3">{selectedTicket.message}</p>

                          {selectedTicket.image_url && (
                            <div className="mt-3">
                              <img
                                src={selectedTicket.image_url || "/placeholder.svg"}
                                alt="ضمیمه تیکت"
                                className="max-w-xs rounded-lg border"
                              />
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-3">
                            ایجاد شده: {new Date(selectedTicket.created_at).toLocaleString("fa-IR")}
                          </div>
                        </div>

                        {/* Responses */}
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-3">
                            {ticketResponses.map((response) => (
                              <div
                                key={response.id}
                                className={`p-3 rounded-lg ${
                                  response.is_admin
                                    ? "bg-blue-50 border-r-4 border-blue-500"
                                    : "bg-gray-50 border-r-4 border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">
                                    {response.is_admin ? "🛡️ پشتیبانی" : "👤 کاربر"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(response.created_at).toLocaleString("fa-IR")}
                                  </span>
                                </div>
                                <p className="text-sm">{response.message}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        {/* Add Response */}
                        {selectedTicket.status !== "closed" && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-sm mb-2">پاسخ جدید</h4>
                            <Textarea
                              value={newResponse}
                              onChange={(e) => setNewResponse(e.target.value)}
                              placeholder="پاسخ خود را بنویسید..."
                              className="mb-3"
                              rows={4}
                            />
                            <Button
                              onClick={handleResponseSubmit}
                              disabled={!newResponse.trim() || submittingResponse}
                              className="w-full"
                            >
                              {submittingResponse ? "در حال ارسال..." : "📤 ارسال پاسخ"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">تیکتی را برای مشاهده جزئیات انتخاب کنید</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>تنظیمات ظاهری</CardTitle>
                <CardDescription>نام و رنگ اصلی چت‌بات را تغییر دهید.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="chatbotName">نام چت‌بات</Label>
                  <Input
                    id="chatbotName"
                    value={appearance.name}
                    onChange={(e) => setAppearance({ ...appearance, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">رنگ اصلی</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={appearance.primary_color}
                      onChange={(e) => setAppearance({ ...appearance, primary_color: e.target.value })}
                      className="p-1 h-10 w-14"
                    />
                    <Input
                      value={appearance.primary_color}
                      onChange={(e) => setAppearance({ ...appearance, primary_color: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveAppearance} disabled={isSavingAppearance} className="w-full">
                  {isSavingAppearance ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ml-2 h-4 w-4" />
                  )}
                  ذخیره تغییرات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>پیش‌نمایش زنده</CardTitle>
                <CardDescription>چت‌بات را تست کنید و کد امبد را برای سایت خود کپی کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                <LivePreview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
