"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Eye, Code, Globe, Smartphone, Monitor, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Chatbot {
  id: number
  name: string
  position: string
  margin_x: number
  margin_y: number
  primary_color: string
  chat_icon: string
}

export default function EmbedPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      const response = await fetch("/api/chatbots")
      if (response.ok) {
        const data = await response.json()
        setChatbots(data)
        if (data.length > 0) {
          setSelectedChatbot(data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error)
      toast({
        title: "خطا",
        description: "خطا در بارگذاری چت‌بات‌ها",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateEmbedCode = (type: string) => {
    if (!selectedChatbot) return ""

    const baseUrl = "https://talksellapi.vercel.app"
    const chatbotId = selectedChatbot.id

    switch (type) {
      case "html":
        return `<script 
  src="${baseUrl}/api/widget-loader" 
  data-chatbot-id="${chatbotId}" 
  async>
</script>`

      case "wordpress":
        return `<!-- در بخش Header یا Footer تم وردپرس خود قرار دهید -->
<script 
  src="${baseUrl}/api/widget-loader" 
  data-chatbot-id="${chatbotId}" 
  async>
</script>`

      case "react":
        return `// در کامپوننت React خود
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/api/widget-loader';
    script.setAttribute('data-chatbot-id', '${chatbotId}');
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      {/* محتوای اپلیکیشن شما */}
    </div>
  );
}`

      case "nextjs":
        return `// در فایل _app.js یا layout.js
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="${baseUrl}/api/widget-loader"
        data-chatbot-id="${chatbotId}"
        strategy="afterInteractive"
      />
    </>
  );
}`

      default:
        return ""
    }
  }

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(type)
      toast({
        title: "کپی شد!",
        description: "کد با موفقیت کپی شد",
      })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در کپی کردن کد",
        variant: "destructive",
      })
    }
  }

  const openPreview = () => {
    if (selectedChatbot) {
      window.open(`/widget/${selectedChatbot.id}`, "_blank", "width=450,height=700")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">کد امبد چت‌بات</h1>
        <p className="text-gray-600">کد امبد چت‌بات خود را دریافت کنید و در وب‌سایت خود قرار دهید</p>
      </div>

      {chatbots.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">هیچ چت‌باتی موجود نیست</h3>
            <p className="text-gray-500 mb-6">ابتدا یک چت‌بات ایجاد کنید</p>
            <Button onClick={() => (window.location.href = "/chatbots/new")}>ایجاد چت‌بات جدید</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* انتخاب چت‌بات */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  انتخاب چت‌بات
                </CardTitle>
                <CardDescription>چت‌باتی که می‌خواهید امبد کنید را انتخاب کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {chatbots.map((chatbot) => (
                  <div
                    key={chatbot.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedChatbot?.id === chatbot.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedChatbot(chatbot)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{chatbot.name}</h3>
                      <Badge variant="outline">ID: {chatbot.id}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{chatbot.chat_icon}</span>
                        <span>موقعیت: {chatbot.position}</span>
                      </div>
                      <div>
                        فاصله: {chatbot.margin_x}px × {chatbot.margin_y}px
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: chatbot.primary_color }}></div>
                        <span>{chatbot.primary_color}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedChatbot && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    پیش‌نمایش
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={openPreview} className="w-full bg-transparent" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    مشاهده پیش‌نمایش
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* کدهای امبد */}
          <div className="lg:col-span-2">
            {selectedChatbot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    کدهای امبد
                  </CardTitle>
                  <CardDescription>
                    کد مناسب پلتفرم خود را انتخاب کنید. تنظیمات موقعیت و فاصله از پنل ادمین اعمال می‌شود.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="html" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        HTML
                      </TabsTrigger>
                      <TabsTrigger value="wordpress" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        WordPress
                      </TabsTrigger>
                      <TabsTrigger value="react" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        React
                      </TabsTrigger>
                      <TabsTrigger value="nextjs" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Next.js
                      </TabsTrigger>
                    </TabsList>

                    {["html", "wordpress", "react", "nextjs"].map((type) => (
                      <TabsContent key={type} value={type} className="mt-6">
                        <div className="relative">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{generateEmbedCode(type)}</code>
                          </pre>
                          <Button
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(generateEmbedCode(type), type)}
                          >
                            {copiedCode === type ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">📋 نکات مهم:</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• موقعیت و فاصله‌ها از تنظیمات پنل ادمین خوانده می‌شود</li>
                      <li>• برای تغییر موقعیت، به بخش "تنظیمات چت‌بات" مراجعه کنید</li>
                      <li>• کد را در قسمت &lt;head&gt; یا قبل از &lt;/body&gt; قرار دهید</li>
                      <li>• ویجت به صورت خودکار بارگذاری می‌شود</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
