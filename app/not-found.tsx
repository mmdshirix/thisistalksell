import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <FileQuestion className="h-24 w-24 text-blue-400 mb-6" />
      <h1 className="text-5xl font-bold text-gray-800">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-600">صفحه مورد نظر یافت نشد</h2>
      <p className="mt-2 text-gray-500">
        متاسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد یا به آدرس دیگری منتقل شده است.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">بازگشت به صفحه اصلی</Link>
      </Button>
    </div>
  )
}
