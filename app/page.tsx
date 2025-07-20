"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff } from "lucide-react"

const CORRECT_PASSWORD = "Mmd38163816@S#iri"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // بررسی اینکه آیا کاربر قبلاً وارد شده یا نه
    const savedAuth = localStorage.getItem("homepage_auth")
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("homepage_auth", "authenticated")
      setError("")
    } else {
      setError("رمز عبور اشتباه است")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">ورود به سیستم</CardTitle>
            <p className="text-gray-600 mt-2">برای دسترسی به سیستم، رمز عبور را وارد کنید</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور را وارد کنید"
                  className="pr-10 h-12 rounded-xl border-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700">
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // محتوای اصلی صفحه پس از احراز هویت
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">سیستم مدیریت چت‌بات هوشمند</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            پلتفرم پیشرفته برای ایجاد، مدیریت و بهینه‌سازی چت‌بات‌های هوشمند با قابلیت‌های کامل پشتیبانی و تحلیل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600">🤖 چت‌بات هوشمند</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                ایجاد چت‌بات‌های پیشرفته با قابلیت پاسخگویی خودکار و یادگیری از تعاملات کاربران
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-green-600">📊 تحلیل و گزارش</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">ابزارهای تحلیلی قدرتمند برای بررسی عملکرد چت‌بات و رفتار کاربران</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl text-purple-600">🎫 سیستم تیکت</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">مدیریت حرفه‌ای درخواست‌های پشتیبانی با سیستم تیکت‌دهی پیشرفته</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">🚀 شروع سریع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">برای شروع کار با سیستم:</p>
                <div className="text-right space-y-2">
                  <p>1. به بخش چت‌بات‌ها بروید</p>
                  <p>2. چت‌بات جدید ایجاد کنید</p>
                  <p>3. تنظیمات را شخصی‌سازی کنید</p>
                  <p>4. کد را در سایت خود قرار دهید</p>
                </div>
                <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700">
                  <a href="/chatbots">شروع کنید</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">📱 ویژگی‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-right space-y-2">
                  <p>✅ رابط کاربری ساده و کاربردی</p>
                  <p>✅ پشتیبانی از زبان فارسی</p>
                  <p>✅ تحلیل‌های پیشرفته</p>
                  <p>✅ سیستم تیکت حرفه‌ای</p>
                  <p>✅ پنل مدیریت کامل</p>
                  <p>✅ امکان شخصی‌سازی کامل</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
