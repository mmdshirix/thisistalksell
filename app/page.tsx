"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Settings, BarChart3, Eye, Sparkles, Lock } from "lucide-react"

const CORRECT_PASSWORD = "Mmd38163816@S#iri"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("homepage_auth")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("homepage_auth", "true")
      setError("")
    } else {
      setError("رمز عبور اشتباه است")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">دسترسی محدود</CardTitle>
            <CardDescription>برای ورود به سیستم رمز عبور را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="text-center"
                />
              </div>
              {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              سیستم مدیریت
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> چت‌بات</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              پلتفرم کاملی برای ایجاد، مدیریت و بهینه‌سازی چت‌بات‌های هوشمند با قابلیت‌های پیشرفته
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                <Link href="/chatbots/new">
                  <Plus className="h-5 w-5 mr-2" />
                  ایجاد چت‌بات جدید
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 hover:bg-gray-50 bg-transparent">
                <Link href="/sample-chatbot">
                  <Sparkles className="h-5 w-5 mr-2" />
                  مشاهده نمونه
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">قابلیت‌های کلیدی</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">تمام ابزارهای مورد نیاز برای ایجاد چت‌بات حرفه‌ای</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-3 bg-blue-100 rounded-lg w-fit">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>مدیریت چت‌بات</CardTitle>
                <CardDescription>ایجاد و مدیریت چت‌بات‌های متعدد با تنظیمات کامل</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-3 bg-green-100 rounded-lg w-fit">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>تنظیمات پیشرفته</CardTitle>
                <CardDescription>شخصی‌سازی کامل ظاهر، رنگ‌ها و رفتار چت‌بات</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-3 bg-purple-100 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>آمار و تحلیل</CardTitle>
                <CardDescription>گزارش‌های دقیق از عملکرد و تعامل کاربران</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Chatbot Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">چت‌بات نمونه</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نمونه کاملی از چت‌بات با تمام قابلیت‌ها را مشاهده کنید
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    فروشگاه تکنولوژی پیشرفته
                  </CardTitle>
                  <CardDescription>چت‌بات کاملی برای فروشگاه آنلاین با قابلیت‌های زیر:</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>۶ محصول نمونه با تصاویر و قیمت
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>۴ سوال متداول پیش‌تعریف شده
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>۶ گزینه سریع برای راهنمایی کاربران
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      سیستم تیکت پشتیبانی یکپارچه
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      پنل مدیریت کامل با آمار و گزارش
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Link href="/sample-chatbot">
                    <Eye className="h-4 w-4 mr-2" />
                    مشاهده جزئیات
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/test-sample-widget">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    تست زنده
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div>
                      <h4 className="font-medium">فروشگاه تکنولوژی</h4>
                      <p className="text-xs opacity-80">آنلاین</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-100 rounded-lg p-3 text-sm">
                    سلام! به فروشگاه تکنولوژی پیشرفته خوش آمدید 🚀
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-blue-50 text-blue-700 rounded-lg p-2 text-xs">💻 لپ‌تاپ و کامپیوتر</button>
                    <button className="bg-blue-50 text-blue-700 rounded-lg p-2 text-xs">📱 گوشی هوشمند</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">شروع سریع</h2>
            <p className="text-xl text-gray-600">با چند کلیک چت‌بات خود را راه‌اندازی کنید</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <CardTitle>ایجاد چت‌بات جدید</CardTitle>
                <CardDescription>چت‌بات جدید با تنظیمات پیش‌فرض ایجاد کنید</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild className="w-full">
                  <Link href="/chatbots/new">شروع کنید</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <CardTitle>مدیریت چت‌بات‌ها</CardTitle>
                <CardDescription>چت‌بات‌های موجود را مشاهده و مدیریت کنید</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/chatbots">مشاهده لیست</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle>راه‌اندازی دیتابیس</CardTitle>
                <CardDescription>دیتابیس را برای اولین بار راه‌اندازی کنید</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/database-setup">راه‌اندازی</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">سیستم مدیریت چت‌بات</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              پلتفرم کاملی برای ایجاد و مدیریت چت‌بات‌های هوشمند با قابلیت‌های پیشرفته
            </p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <Link href="/sample-chatbot">نمونه چت‌بات</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <Link href="/database-setup">راهنمای نصب</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
