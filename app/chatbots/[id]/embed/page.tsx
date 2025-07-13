"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Copy, ExternalLink } from "lucide-react"

export default function EmbedPage() {
  const params = useParams()
  const chatbotId = params.id
  const [copied, setCopied] = useState(false)

  const appUrl = "https://talksellapi.vercel.app"
  const embedCode = `<script src="${appUrl}/api/widget-loader" data-chatbot-id="${chatbotId}" defer></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">کد امبد چت‌بات</h1>
          <p className="text-gray-600">کد زیر را در وب‌سایت خود قرار دهید تا چت‌بات نمایش داده شود.</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>کد امبد</span>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="ml-auto bg-transparent">
                  <Copy className="w-4 h-4 mr-2" />
                  کپی
                </Button>
              </CardTitle>
              <CardDescription>این کد را قبل از تگ بسته شدن body در صفحات وب‌سایت خود قرار دهید.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>پیش‌نمایش</CardTitle>
              <CardDescription>برای مشاهده چت‌بات در حالت کامل، روی دکمه زیر کلیک کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href={`${appUrl}/widget/${chatbotId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  مشاهده پیش‌نمایش
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>راهنمای نصب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. کپی کردن کد</h3>
                <p className="text-gray-600 text-sm">کد امبد بالا را کپی کنید.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. قرار دادن در وب‌سایت</h3>
                <p className="text-gray-600 text-sm">
                  کد را قبل از تگ &lt;/body&gt; در تمام صفحاتی که می‌خواهید چت‌بات نمایش داده شود، قرار دهید.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. تست عملکرد</h3>
                <p className="text-gray-600 text-sm">وب‌سایت خود را بازدید کنید و چت‌بات را تست کنید.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
