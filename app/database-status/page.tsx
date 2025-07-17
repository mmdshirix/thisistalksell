"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCwIcon as Refresh } from "lucide-react"

interface DatabaseStatus {
  success: boolean
  message: string
  data?: any
}

interface DatabaseLogs {
  timestamp: Date
  message: string
  type: "INFO" | "ERROR"
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [logs, setLogs] = useState<DatabaseLogs[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const checkDatabaseStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setStatus(data.status)
      setLogs(data.logs || [])
    } catch (error) {
      setStatus({
        success: false,
        message: `خطا در اتصال به API: ${error}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleString("fa-IR")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">وضعیت دیتابیس</h1>
            <p className="text-muted-foreground">مانیتورینگ و بررسی اتصال دیتابیس</p>
          </div>
        </div>
        <Button onClick={checkDatabaseStatus} disabled={isLoading} variant="outline">
          <Refresh className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Database Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status?.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              وضعیت اتصال
            </CardTitle>
            <CardDescription>آخرین بررسی: {new Date().toLocaleString("fa-IR")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">وضعیت:</span>
              <Badge variant={status?.success ? "default" : "destructive"}>{status?.success ? "متصل" : "قطع"}</Badge>
            </div>

            {status && (
              <Alert variant={status.success ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            {status?.data && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">اطلاعات دیتابیس:</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">زمان سرور:</span> {status.data.now}
                  </div>
                  <div>
                    <span className="font-medium">نسخه PostgreSQL:</span> {status.data.version}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Logs */}
        <Card>
          <CardHeader>
            <CardTitle>لاگ‌های دیتابیس</CardTitle>
            <CardDescription>آخرین فعالیت‌های دیتابیس ({logs.length} مورد)</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge variant={log.type === "ERROR" ? "destructive" : "secondary"} className="text-xs">
                      {log.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(log.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>هیچ لاگی موجود نیست</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات محیط</CardTitle>
            <CardDescription>متغیرهای محیطی و تنظیمات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DATABASE_URL:</span>
                  <Badge variant={process.env.DATABASE_URL ? "default" : "destructive"}>
                    {process.env.DATABASE_URL ? "تنظیم شده" : "تنظیم نشده"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">NODE_ENV:</span>
                  <Badge variant="outline">{process.env.NODE_ENV || "development"}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DEEPSEEK_API_KEY:</span>
                  <Badge variant={process.env.DEEPSEEK_API_KEY ? "default" : "secondary"}>
                    {process.env.DEEPSEEK_API_KEY ? "تنظیم شده" : "تنظیم نشده"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next.js Runtime:</span>
                  <Badge variant="outline">Node.js</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>عملیات سریع</CardTitle>
            <CardDescription>دسترسی سریع به عملیات مهم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/api/database/init" target="_blank" rel="noreferrer">
                  راه‌اندازی دیتابیس
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/api/database/structure" target="_blank" rel="noreferrer">
                  ساختار جداول
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/chatbots" target="_blank" rel="noreferrer">
                  مدیریت چت‌بات‌ها
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/debug-admin" target="_blank" rel="noreferrer">
                  پنل دیباگ
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
