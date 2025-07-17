import { notFound } from "next/navigation"
import { getChatbot } from "@/lib/db"
import ChatbotSettingsForm from "@/components/chatbot-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, Settings, BarChart3, Users, MessageSquare } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default async function ChatbotPage({ params }: PageProps) {
  const chatbotId = Number.parseInt(params.id)

  if (isNaN(chatbotId)) {
    notFound()
  }

  const chatbot = await getChatbot(chatbotId)

  if (!chatbot) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            {chatbot.name}
          </h1>
          <p className="text-muted-foreground mt-1">مدیریت و تنظیمات چت‌بات</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/chatbots/${chatbot.id}/preview`}>
              <Eye className="w-4 h-4 mr-2" />
              پیش‌نمایش
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/chatbots/${chatbot.id}/analytics`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              آمار
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              وضعیت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500">
              فعال
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              کاربران
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">کاربر فعال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              پیام‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">پیام امروز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              لینک
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
              <Link href={`/widget/${chatbot.id}`} target="_blank">
                مشاهده ویجت
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">تنظیمات</TabsTrigger>
          <TabsTrigger value="embed">کد تعبیه</TabsTrigger>
          <TabsTrigger value="analytics">آمار</TabsTrigger>
          <TabsTrigger value="tickets">تیکت‌ها</TabsTrigger>
          <TabsTrigger value="admin-users">مدیران</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات چت‌بات</CardTitle>
              <CardDescription>تنظیمات ظاهری و عملکردی چت‌بات خود را مدیریت کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatbotSettingsForm chatbot={chatbot} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>کد تعبیه</CardTitle>
              <CardDescription>این کد را در وب‌سایت خود قرار دهید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/widget-loader.js" data-chatbot-id="${chatbot.id}"></script>`}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-8">
            <p className="text-muted-foreground">آمار در حال توسعه است</p>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="text-center py-8">
            <p className="text-muted-foreground">مدیریت تیکت‌ها در حال توسعه است</p>
          </div>
        </TabsContent>

        <TabsContent value="admin-users">
          <div className="text-center py-8">
            <p className="text-muted-foreground">مدیریت کاربران مدیر در حال توسعه است</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
