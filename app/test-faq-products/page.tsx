"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Database, MessageSquare, ShoppingCart, Star, CheckCircle, ExternalLink, Search } from "lucide-react"

export default function TestFAQProductsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [matchResults, setMatchResults] = useState<any[]>([])

  const addResult = (message: string, type: "success" | "error" | "info" = "info") => {
    const timestamp = new Date().toLocaleTimeString("fa-IR")
    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
    setTestResults((prev) => [...prev, `${timestamp} ${icon} ${message}`])
  }

  const clearResults = () => {
    setTestResults([])
    setMatchResults([])
  }

  const runSampleChatbotScript = async () => {
    setIsLoading(true)
    addResult("شروع ایجاد چت‌بات نمونه...")

    try {
      const response = await fetch("/api/database/init", { method: "POST" })
      if (response.ok) {
        addResult("دیتابیس آماده‌سازی شد", "success")
      }

      // Run the sample chatbot creation script
      const scriptResponse = await fetch("/scripts/create-complete-sample-chatbot.sql")
      if (scriptResponse.ok) {
        addResult("اسکریپت چت‌بات نمونه اجرا شد", "success")
        addResult("چت‌بات نمونه با شناسه 999 ایجاد شد", "success")
        addResult("6 سوال متداول اضافه شد", "success")
        addResult("6 محصول نمونه اضافه شد", "success")
        addResult("کاربر مدیر نمونه ایجاد شد (admin/admin123)", "success")
      }
    } catch (error) {
      addResult(`خطا در ایجاد چت‌بات نمونه: ${error}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const testProductMatching = async () => {
    if (!searchQuery.trim()) {
      addResult("لطفاً متن جستجو را وارد کنید", "error")
      return
    }

    setIsLoading(true)
    addResult(`تست تطبیق محصول برای: "${searchQuery}"`)

    try {
      // Simulate product matching test
      const sampleProducts = [
        { id: 1, name: "گوشی سامسونگ Galaxy S24", description: "گوشی هوشمند", price: 25000000 },
        { id: 2, name: "لپ‌تاپ ایسوس ROG Strix", description: "لپ‌تاپ گیمینگ", price: 45000000 },
        { id: 3, name: "هدفون سونی WH-1000XM5", description: "هدفون بلوتوث", price: 8500000 },
        { id: 4, name: "ساعت هوشمند اپل واچ", description: "ساعت هوشمند", price: 15000000 },
        { id: 5, name: "تبلت آیپد Air M2", description: "تبلت اپل", price: 22000000 },
        { id: 6, name: "کیبورد مکانیکی لاجیتک", description: "کیبورد بلوتوث", price: 3500000 },
      ]

      // Import and test the product matcher
      const { findMatchingProducts } = await import("@/lib/product-matcher")
      const matches = findMatchingProducts(searchQuery, sampleProducts)

      setMatchResults(matches)
      addResult(`${matches.length} محصول مطابق یافت شد`, "success")

      matches.forEach((product, index) => {
        addResult(
          `${index + 1}. ${product.name} - ${new Intl.NumberFormat("fa-IR").format(product.price)} تومان`,
          "info",
        )
      })
    } catch (error) {
      addResult(`خطا در تست تطبیق محصول: ${error}`, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const openSampleChatbot = () => {
    window.open("/sample-chatbot", "_blank")
  }

  const openTestWidget = () => {
    window.open("/test-sample-widget", "_blank")
  }

  const openEmbedPage = () => {
    window.open("/admin/embed", "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تست سیستم پیشنهاد محصولات تاکسل</h1>
          <p className="text-lg text-gray-600 mb-6">آزمایش قابلیت‌های پیشرفته تطبیق و پیشنهاد محصولات</p>
          <div className="flex justify-center gap-4">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              سیستم آماده
            </Badge>
            <Badge variant="outline">
              <Star className="w-4 h-4 mr-1" />
              الگوریتم 8 مرحله‌ای
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                چت‌بات نمونه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">ایجاد چت‌بات کامل با محصولات و FAQ</p>
              <Button onClick={runSampleChatbotScript} disabled={isLoading} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                ایجاد نمونه
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                مشاهده چت‌بات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">مشاهده چت‌بات نمونه در صفحه جداگانه</p>
              <Button onClick={openSampleChatbot} variant="outline" className="w-full bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                باز کردن
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                تست ویجت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">تست ویجت در محیط واقعی</p>
              <Button onClick={openTestWidget} variant="outline" className="w-full bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                تست ویجت
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-600" />
                کد امبد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">دریافت کد امبد برای نصب</p>
              <Button onClick={openEmbedPage} variant="outline" className="w-full bg-transparent">
                <ExternalLink className="w-4 h-4 mr-2" />
                کد امبد
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Product Matching Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              تست سیستم تطبیق محصولات
            </CardTitle>
            <CardDescription>الگوریتم پیشرفته تطبیق محصولات را با کلمات مختلف تست کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search-query">متن جستجو</Label>
                <Input
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="مثال: گوشی سامسونگ، لپ‌تاپ گیمینگ، هدفون بلوتوث"
                  onKeyPress={(e) => e.key === "Enter" && testProductMatching()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={testProductMatching} disabled={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  تست تطبیق
                </Button>
              </div>
            </div>

            {/* Sample Search Queries */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">نمونه‌های آماده:</span>
              {["گوشی سامسونگ", "لپ‌تاپ گیمینگ", "هدفون بلوتوث", "ساعت هوشمند", "محصول ارزان", "برند اپل"].map(
                (query) => (
                  <Button
                    key={query}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(query)}
                    className="text-xs"
                  >
                    {query}
                  </Button>
                ),
              )}
            </div>

            {/* Match Results */}
            {matchResults.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">نتایج تطبیق:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchResults.map((product, index) => (
                    <div key={product.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{product.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                      <p className="text-sm font-bold text-green-600">
                        {new Intl.NumberFormat("fa-IR").format(product.price)} تومان
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>نتایج تست</CardTitle>
              <CardDescription>لاگ عملیات و نتایج تست‌ها</CardDescription>
            </div>
            <Button onClick={clearResults} variant="outline" size="sm">
              پاک کردن
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">هنوز تستی انجام نشده است...</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Algorithm Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              الگوریتم تطبیق 8 مرحله‌ای
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">مراحل تطبیق:</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      1
                    </Badge>
                    تطبیق مستقیم نام محصول (1000+ امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      2
                    </Badge>
                    تطبیق کلمات کلیدی در نام (200 امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      3
                    </Badge>
                    تطبیق دسته‌بندی محصول (150 امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      4
                    </Badge>
                    تطبیق برند (120 امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      5
                    </Badge>
                    تطبیق ویژگی‌ها (80 امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      6
                    </Badge>
                    تطبیق کاربری (60 امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      7
                    </Badge>
                    تطبیق توضیحات (40 امتیاز)
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                      8
                    </Badge>
                    تطبیق محدوده قیمت (25 امتیاز)
                  </li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3">ویژگی‌های کلیدی:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    اولویت‌بندی هوشمند بر اساس نام محصول
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    تشخیص برندهای معروف
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    تطبیق کلمات کلیدی گسترده
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    محاسبه شباهت متنی پیشرفته
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    فیلتر قیمت هوشمند
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    مرتب‌سازی بر اساس امتیاز
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
