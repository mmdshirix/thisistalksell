"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageSquare, Settings, Trash2, Loader2, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Chatbot {
  id: number
  name: string
  primary_color: string
  created_at: string
}

export default function HomePage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadChatbots = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/chatbots")
      const result = await response.json()
      if (result.success) {
        setChatbots(result.data)
      } else {
        throw new Error(result.message || "Failed to load chatbots")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setChatbots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChatbots()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/chatbots/${id}`, { method: "DELETE" })
      const result = await response.json()
      if (result.success) {
        toast.success("چت‌بات با موفقیت حذف شد.")
        setChatbots((prev) => prev.filter((bot) => bot.id !== id))
      } else {
        throw new Error(result.message || "Failed to delete chatbot")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-800">پلتفرم چت‌بات تاکسل</h1>
          </div>
          <Button asChild>
            <Link href="/chatbots/new">
              <Plus className="ml-2 h-4 w-4" />
              ساخت چت‌بات جدید
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-red-800">خطا در بارگذاری</h3>
              <p className="text-red-700 mt-2 mb-6">{error}</p>
              <Button onClick={loadChatbots} variant="destructive">
                تلاش مجدد
              </Button>
            </CardContent>
          </Card>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-gray-900">اولین چت‌بات خود را بسازید</h3>
            <p className="mt-1 text-gray-500">برای شروع، یک چت‌بات جدید ایجاد کنید.</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/chatbots/new">
                  <Plus className="ml-2 h-4 w-4" />
                  ساخت چت‌بات جدید
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map((bot) => (
              <Card key={bot.id} className="flex flex-col justify-between transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: bot.primary_color, color: "white" }}
                    >
                      💬
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{bot.name}</CardTitle>
                      <CardDescription>
                        ایجاد شده در: {new Date(bot.created_at).toLocaleDateString("fa-IR")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <div className="w-full flex items-center gap-2">
                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                      <Link href={`/chatbots/${bot.id}`}>
                        <Settings className="ml-2 h-4 w-4" />
                        مدیریت
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            این عمل قابل بازگشت نیست. چت‌بات و تمام اطلاعات مرتبط با آن برای همیشه حذف خواهد شد.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(bot.id)}>حذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
