import { testDatabaseConnection, dbLogger } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Activity } from "lucide-react"

export default async function DatabaseStatusPage() {
  const connectionTest = await testDatabaseConnection()
  const logs = dbLogger.getLogs()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">وضعیت دیتابیس</h1>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionTest.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            وضعیت اتصال
          </CardTitle>
          <CardDescription>
            {connectionTest.success ? "اتصال به دیتابیس برقرار است" : "خطا در اتصال به دیتابیس"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>وضعیت:</span>
              <Badge variant={connectionTest.success ? "default" : "destructive"}>
                {connectionTest.success ? "متصل" : "قطع"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>پیام:</span>
              <span className="text-sm text-gray-600">{connectionTest.message}</span>
            </div>
            {connectionTest.data && (
              <>
                <div className="flex items-center justify-between">
                  <span>زمان سرور:</span>
                  <span className="text-sm font-mono">{connectionTest.data.now}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>نسخه PostgreSQL:</span>
                  <span className="text-sm font-mono">{connectionTest.data.version}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Database Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            لاگ‌های اخیر دیتابیس
          </CardTitle>
          <CardDescription>آخرین فعالیت‌های ثبت شده در سیستم دیتابیس</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">هیچ لاگی ثبت نشده است</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    log.type === "ERROR"
                      ? "bg-red-50 border-red-500 text-red-800"
                      : "bg-blue-50 border-blue-500 text-blue-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={log.type === "ERROR" ? "destructive" : "secondary"}>{log.type}</Badge>
                    <span className="text-xs text-gray-500">{log.timestamp.toLocaleString("fa-IR")}</span>
                  </div>
                  <p className="text-sm font-mono">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>تنظیمات دیتابیس</CardTitle>
          <CardDescription>اطلاعات پیکربندی دیتابیس</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>نوع دیتابیس:</span>
              <Badge>PostgreSQL</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>متغیر محیطی:</span>
              <Badge variant="outline">DATABASE_URL</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>SSL:</span>
              <Badge variant="secondary">فعال</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Connection Pool:</span>
              <Badge variant="secondary">فعال</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
