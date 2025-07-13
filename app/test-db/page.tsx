import { getChatbots, testDatabaseConnection } from "@/lib/db"

export default async function TestDatabasePage() {
  let dbStatus = "❌ خطا در اتصال"
  let connectionMessage = ""
  let chatbots: any[] = []
  let error: string | null = null

  try {
    console.log("🔍 Testing database connection...")
    const connectionTest = await testDatabaseConnection()
    connectionMessage = connectionTest.message
    if (connectionTest.success) {
      dbStatus = "✅ اتصال موفق"
      console.log("✅ Database connection successful.")
      console.log("🔍 Fetching chatbots for test...")
      chatbots = await getChatbots()
      console.log(`✅ Found ${chatbots.length} chatbots.`)
    } else {
      console.error("❌ Database connection failed:", connectionMessage)
      error = connectionMessage
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "خطای نامشخص در هنگام تست"
    console.error("❌ Database test page failed:", err)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">تست کامل اتصال به دیتابیس Neon</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">۱. وضعیت اتصال</h2>
          <div className="text-lg font-bold">{dbStatus}</div>
          <p className="text-gray-600 mt-2">{connectionMessage}</p>
          {error && !connectionMessage.includes(error) && (
            <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">
              <strong>جزئیات خطا:</strong> {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">۲. متغیرهای محیطی</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>DATABASE_URL:</strong>{" "}
              {process.env.DATABASE_URL ? (
                <span className="text-green-600">✅ تنظیم شده</span>
              ) : (
                <span className="text-red-600">❌ تنظیم نشده</span>
              )}
            </div>
            <div>
              <strong>DEEPSEEK_API_KEY:</strong>{" "}
              {process.env.DEEPSEEK_API_KEY ? (
                <span className="text-green-600">✅ تنظیم شده</span>
              ) : (
                <span className="text-yellow-600">⚠️ تنظیم نشده (برای عملکرد AI لازم است)</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">۳. لیست چت‌بات‌ها ({chatbots.length})</h2>
          {chatbots.length > 0 ? (
            <div className="space-y-4">
              {chatbots.map((chatbot) => (
                <div key={chatbot.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">
                    {chatbot.name} (ID: {chatbot.id})
                  </h3>
                  <p className="text-sm text-gray-600">ضریب آمار: {chatbot.stats_multiplier ?? "1.0"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              {dbStatus === "✅ اتصال موفق"
                ? "هیچ چت‌باتی یافت نشد. می‌توانید از صفحه ساخت چت‌بات جدید، یکی بسازید."
                : "به دلیل عدم اتصال به دیتابیس، لیست چت‌بات‌ها قابل نمایش نیست."}
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/database-setup"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            رفتن به صفحه راه‌اندازی دیتابیس
          </a>
        </div>
      </div>
    </div>
  )
}
