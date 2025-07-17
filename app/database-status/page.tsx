"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server, Zap } from "lucide-react"

interface DatabaseStatus {
  connected: boolean
  tables: string[]
  error?: string
  connectionInfo?: {
    host: string
    database: string
    user: string
  }
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setStatus(data)
      setLastChecked(new Date())
    } catch (error) {
      setStatus({
        connected: false,
        tables: [],
        error: "خطا در اتصال به API",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
    if (status?.connected) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">در حال بررسی...</Badge>
    if (status?.connected)
      return (
        <Badge variant="default" className="bg-green-500">
          متصل
        </Badge>
      )
    return <Badge variant="destructive">قطع</Badge>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-blue-600" />
            وضعیت دیتابیس
          </h1>
          <p className="text-muted-foreground mt-1">مانیتورینگ اتصال و وضعیت دیتابیس</p>
        </div>
        <Button onClick={checkDatabaseStatus} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          بروزرسانی
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              وضعیت اتصال
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>{lastChecked && `آخرین بررسی: ${lastChecked.toLocaleString("fa-IR")}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">
                  {loading ? "در حال بررسی اتصال..." : status?.connected ? "اتصال برقرار است" : "اتصال برقرار نیست"}
                </p>
                {status?.error && <p className="text-sm text-red-500 mt-1">{status.error}</p>}
              </div>
            </div>

            {status?.connectionInfo && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">اطلاعات اتصال:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">میزبان:</span> {status.connectionInfo.host}
                  </div>
                  <div>
                    <span className="font-medium">دیتابیس:</span> {status.connectionInfo.database}
                  </div>
                  <div>
                    <span className="font-medium">کاربر:</span> {status.connectionInfo.user}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tables Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              جداول دیتابیس
              <Badge variant="outline">{status?.tables.length || 0} جدول</Badge>
            </CardTitle>
            <CardDescription>لیست جداول موجود در دیتابیس</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2">در حال بارگذاری...</span>
              </div>
            ) : status?.tables.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {status.tables.map((table, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-mono">{table}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-5 w-5 mr-2" />
                هیچ جدولی یافت نشد
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات سیستم</CardTitle>
            <CardDescription>جزئیات محیط و پیکربندی</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">محیط:</span>{" "}
                <Badge variant="outline">{process.env.NODE_ENV || "development"}</Badge>
              </div>
              <div>
                <span className="font-medium">نسخه Node.js:</span> {process.version}
              </div>
              <div>
                <span className="font-medium">پلتفرم:</span> {process.platform}
              </div>
              <div>
                <span className="font-medium">معماری:</span> {process.arch}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-xs text-muted-foreground">
              <p>این صفحه برای مانیتورینگ وضعیت دیتابیس و عیب‌یابی مشکلات اتصال طراحی شده است.</p>
              <p className="mt-1">در صورت مشاهده مشکل، لطفاً متغیرهای محیطی و تنظیمات دیتابیس را بررسی کنید.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
