import { notFound } from "next/navigation"
import Link from "next/link"
import { MessageSquare, BarChart, Settings, Eye, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import ChatbotSettingsForm from "@/components/chatbot-settings-form"
import { getChatbotById } from "@/lib/db"

interface EditChatbotPageProps {
  params: {
    id: string
  }
}

export default async function EditChatbotPage({ params }: EditChatbotPageProps) {
  const chatbotId = Number.parseInt(params.id)

  if (isNaN(chatbotId)) {
    notFound()
  }

  const chatbot = await getChatbotById(chatbotId)

  if (!chatbot) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="bg-white shadow rounded-lg mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ویرایش ربات: {chatbot.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <Tabs defaultValue="settings" className="w-full">
          <div className="bg-white shadow rounded-lg mb-6">
            <TabsList className="w-full h-auto flex flex-wrap justify-start border-b p-1">
              <TabsTrigger value="settings" className="flex items-center gap-2 py-3 px-4">
                <Settings className="h-4 w-4" />
                <span>تنظیمات</span>
              </TabsTrigger>
              <TabsTrigger value="admin-users" className="flex items-center gap-2 py-3 px-4">
                <Users className="h-4 w-4" />
                <span>مدیران چت‌بات</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 py-3 px-4">
                <BarChart className="h-4 w-4" />
                <span>آمار</span>
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2 py-3 px-4">
                <MessageSquare className="h-4 w-4" />
                <span>تیکت‌ها</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2 py-3 px-4">
                <Eye className="h-4 w-4" />
                <span>پیش‌نمایش</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <TabsContent value="settings" className="mt-0 space-y-6">
              <ChatbotSettingsForm chatbot={chatbot} />
            </TabsContent>

            <TabsContent value="admin-users" className="mt-0">
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">مدیریت مدیران چت‌بات</h3>
                <p className="text-gray-600 mb-4">ایجاد و مدیریت کاربرانی که به پنل این چت‌بات دسترسی دارند.</p>
                <Link href={`/chatbots/${chatbot.id}/admin-users`}>
                  <Button>مدیریت مدیران</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="text-center py-8">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">آمار و تحلیل</h3>
                <p className="text-gray-600 mb-4">مشاهده آمار و تحلیل عملکرد چت‌بات</p>
                <Link href={`/chatbots/${chatbot.id}/analytics`}>
                  <Button>مشاهده آمار</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="mt-0">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">تیکت‌های پشتیبانی</h3>
                <p className="text-gray-600 mb-4">مدیریت تیکت‌های پشتیبانی کاربران</p>
                <Link href={`/chatbots/${chatbot.id}/tickets`}>
                  <Button>مشاهده تیکت‌ها</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">پیش‌نمایش چت‌بات</h3>
                <p className="text-gray-600 mb-4">مشاهده پیش‌نمایش چت‌بات</p>
                <Link href={`/chatbots/${chatbot.id}/preview`}>
                  <Button>مشاهده پیش‌نمایش</Button>
                </Link>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
