import { testDatabaseConnection, dbLogger } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export const revalidate = 0 // Disable caching for this page

export default async function DatabaseStatusPage() {
  const connectionStatus = await testDatabaseConnection()
  const logs = dbLogger.getLogs()

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>وضعیت اتصال به دیتابیس</span>
              <Badge variant={connectionStatus.success ? "default" : "destructive"} className="bg-green-500 text-white">
                {connectionStatus.success ? "متصل" : "قطع"}
              </Badge>
            </CardTitle>
            <CardDescription>این صفحه وضعیت لحظه‌ای اتصال برنامه به دیتابیس PostgreSQL را نمایش می‌دهد.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{connectionStatus.message}</p>
            {connectionStatus.data && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs font-mono">
                <p>
                  <strong>زمان سرور دیتابیس:</strong> {new Date(connectionStatus.data.now).toLocaleString("fa-IR")}
                </p>
                <p>
                  <strong>نسخه PostgreSQL:</strong> {connectionStatus.data.version}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لاگ‌های اخیر اتصال</CardTitle>
            <CardDescription>نمایش ۱۰۰ لاگ آخر مربوط به فعالیت‌های دیتابیس.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="space-y-2 text-sm font-mono">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">
                        [{new Date(log.timestamp).toLocaleTimeString("fa-IR")}]
                      </span>
                      <Badge variant={log.type === "INFO" ? "secondary" : "destructive"} className="mr-2 h-5">
                        {log.type}
                      </Badge>
                      <span className={`flex-1 ${log.type === "ERROR" ? "text-red-600" : "text-gray-800"}`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">هیچ لاگی برای نمایش وجود ندارد.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
