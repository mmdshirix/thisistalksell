import { notFound } from "next/navigation"
import { getChatbot } from "@/lib/db"
import ChatbotSettingsForm from "@/components/chatbot-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye, Settings, MessageSquare, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

interface ChatbotPageProps {
  params: {
    id: string
  }
}

export default async function ChatbotPage({ params }: ChatbotPageProps) {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            {chatbot.name}
          </h1>
          <p className="text-muted-foreground mt-1">مدیریت و تنظیمات چت‌بات شما</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/chatbots/${chatbot.id}/preview`}>
              <Eye className="w-4 h-4 mr-2" />
              پیش‌نمایش
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/chatbots/${chatbot.id}/embed`}>
              <ExternalLink className="w-4 h-4 mr-2" />
              کد تعبیه
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge variant="default" className="bg-green-500">
          فعال
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            تنظیمات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            آمار
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            تیکت‌ها
          </TabsTrigger>
          <TabsTrigger value="admin-users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            کاربران ادمین
          </TabsTrigger>
          <TabsTrigger value="embed" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            تعبیه
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            پیش‌نمایش
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات چت‌بات</CardTitle>
              <CardDescription>تنظیمات ظاهری، پیام‌ها، و عملکرد چت‌بات را مدیریت کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatbotSettingsForm chatbot={chatbot} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>آمار و گزارشات</CardTitle>
                <CardDescription>آمار استفاده از چت‌بات و تعامل کاربران</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">برای مشاهده آمار کامل به صفحه آنالیتیکس بروید</p>
                  <Button asChild className="mt-4">
                    <Link href={`/chatbots/${chatbot.id}/analytics`}>مشاهده آمار کامل</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت تیکت‌ها</CardTitle>
              <CardDescription>تیکت‌های ارسال شده توسط کاربران را مدیریت کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">برای مدیریت تیکت‌ها به صفحه مخصوص بروید</p>
                <Button asChild className="mt-4">
                  <Link href={`/chatbots/${chatbot.id}/tickets`}>مدیریت تیکت‌ها</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Users Tab */}
        <TabsContent value="admin-users">
          <Card>
            <CardHeader>
              <CardTitle>کاربران ادمین</CardTitle>
              <CardDescription>کاربران ادمین که دسترسی به پنل مدیریت دارند</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">برای مدیریت کاربران ادمین به صفحه مخصوص بروید</p>
                <Button asChild className="mt-4">
                  <Link href={`/chatbots/${chatbot.id}/admin-users`}>مدیریت کاربران ادمین</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed Tab */}
        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle>کد تعبیه</CardTitle>
              <CardDescription>کد HTML برای تعبیه چت‌بات در وب‌سایت خود</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ExternalLink className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">برای دریافت کد تعبیه به صفحه مخصوص بروید</p>
                <Button asChild className="mt-4">
                  <Link href={`/chatbots/${chatbot.id}/embed`}>دریافت کد تعبیه</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>پیش‌نمایش چت‌بات</CardTitle>
              <CardDescription>چت‌بات خود را قبل از انتشار تست کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">برای مشاهده پیش‌نمایش زنده چت‌بات کلیک کنید</p>
                <Button asChild className="mt-4">
                  <Link href={`/chatbots/${chatbot.id}/preview`}>مشاهده پیش‌نمایش</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
