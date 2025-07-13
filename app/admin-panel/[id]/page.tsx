"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  MessageCircle,
  Users,
  Ticket,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Palette,
  LogOut,
  Loader2,
  Bot,
  LifeBuoy,
  Save,
} from "lucide-react"
import ModernChart from "@/components/admin/modern-chart"
import EnhancedTicketManagement from "@/components/admin/enhanced-ticket-management"
import LivePreview from "@/components/admin/live-preview"

interface AdminPanelData {
  chatbot: { id: number; name: string; primary_color: string }
  stats: {
    totalMessages: number
    uniqueUsers: number
    todayMessages: number
    activeTickets: number
  }
  analytics: {
    dailyData: Array<{ name: string; value: number }>
    hourlyData: Array<{ name: string; value: number }>
  }
}

export default function ModernAdminPanel() {
  const params = useParams()
  const router = useRouter()
  const chatbotId = params.id as string

  const [data, setData] = useState<AdminPanelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  const [appearance, setAppearance] = useState({ name: "", primary_color: "#000000" })
  const [isSavingAppearance, setIsSavingAppearance] = useState(false)

  const fetchData = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!isBackgroundRefresh) {
        setLoading(true)
      }
      setIsRefreshing(true)
      try {
        setError(null)
        const response = await fetch(`/api/admin-panel/${chatbotId}/data`)
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            toast.error("نشست شما منقضی شده. لطفاً دوباره وارد شوید.")
            router.push(`/admin-panel/${chatbotId}/login`)
            return
          }
          throw new Error(`خطای سرور: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
        if (!isBackgroundRefresh) {
          setAppearance({ name: result.chatbot.name, primary_color: result.chatbot.primary_color })
        }
        setLastUpdate(new Date().toLocaleTimeString("fa-IR"))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "خطا در اتصال به سرور"
        setError(errorMessage)
        if (!isBackgroundRefresh) toast.error(errorMessage)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [chatbotId, router],
  )

  useEffect(() => {
    if (chatbotId) {
      fetchData() // Initial fetch
      const interval = setInterval(() => fetchData(true), 30000) // Auto-refresh every 30s
      return () => clearInterval(interval) // Cleanup on unmount
    }
  }, [chatbotId, fetchData])

  const handleLogout = async () => {
    toast.info("در حال خروج...")
    await fetch(`/api/admin-panel/${chatbotId}/logout`, { method: "POST" })
    router.push(`/admin-panel/${chatbotId}/login`)
  }

  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true)
    toast.loading("در حال ذخیره تنظیمات ظاهری...")
    try {
      const res = await fetch(`/api/admin-panel/${chatbotId}/appearance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appearance),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "خطا در ذخیره تنظیمات")
      }
      toast.success("تنظیمات ظاهری با موفقیت ذخیره شد!")
      if (data) {
        setData({
          ...data,
          chatbot: { ...data.chatbot, ...appearance },
        })
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "یک خطای ناشناخته رخ داد"
      toast.error(errorMessage)
    } finally {
      setIsSavingAppearance(false)
    }
  }

  const primaryColor = useMemo(() => data?.chatbot.primary_color || "#2563EB", [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600 font-medium">در حال بارگذاری پنل مدیریت...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <CardTitle>خطا در بارگذاری</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || "امکان دسترسی به اطلاعات وجود ندارد"}</p>
            <Button onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
        style={{ borderBottom: `2px solid ${primaryColor}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Bot className="text-white h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">پنل مدیریت: {data.chatbot.name}</h1>
                <p className="text-sm text-gray-500">به پنل مدیریت چت‌بات خود خوش آمدید!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500 hidden md:block">آخرین بروزرسانی: {lastUpdate}</div>
              <Button variant="outline" size="icon" onClick={() => fetchData(true)} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="stats" className="py-2.5">
              <BarChart3 className="h-4 w-4 ml-2" />
              آمار
            </TabsTrigger>
            <TabsTrigger value="tickets" className="py-2.5">
              <Ticket className="h-4 w-4 ml-2" />
              تیکت‌ها
            </TabsTrigger>
            <TabsTrigger value="appearance" className="py-2.5">
              <Palette className="h-4 w-4 ml-2" />
              ظاهر
            </TabsTrigger>
            <TabsTrigger value="preview" className="py-2.5">
              <LifeBuoy className="h-4 w-4 ml-2" />
              پیش‌نمایش
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "پیام‌های امروز", value: data.stats.todayMessages, icon: MessageCircle },
                { title: "کل کاربران", value: data.stats.uniqueUsers, icon: Users },
                { title: "تیکت‌های فعال", value: data.stats.activeTickets, icon: Ticket },
                { title: "کل پیام‌ها", value: data.stats.totalMessages, icon: TrendingUp },
              ].map(({ title, value, icon: Icon }, index) => (
                <Card key={index} className="shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                    <Icon className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{value.toLocaleString("fa-IR")}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>آمار پیام‌های روزانه (۷ روز اخیر)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart data={data.analytics.dailyData} type="area" color={primaryColor} />
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>پیام‌های ساعتی امروز</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModernChart data={data.analytics.hourlyData} type="bar" color={primaryColor} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>مدیریت تیکت‌ها</CardTitle>
                <CardDescription>به تیکت‌های کاربران پاسخ دهید و وضعیت آن‌ها را مدیریت کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedTicketManagement chatbotId={Number(chatbotId)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="max-w-2xl mx-auto shadow-md">
              <CardHeader>
                <CardTitle>تنظیمات ظاهری</CardTitle>
                <CardDescription>نام و رنگ اصلی چت‌بات خود را شخصی‌سازی کنید.</CardDescription>
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
                      className="p-1 h-10 w-14 rounded-md"
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
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>پیش‌نمایش زنده و کد امبد</CardTitle>
                <CardDescription>چت‌بات خود را تست کرده و کد لازم برای افزودن به سایتتان را کپی کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                <LivePreview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
