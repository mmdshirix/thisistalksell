"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 text-center">
      <AlertTriangle className="h-24 w-24 text-red-400 mb-6" />
      <h2 className="text-2xl font-bold text-red-800">یک خطا رخ داده است!</h2>
      <p className="mt-2 text-red-600 max-w-md">متاسفانه در اجرای درخواست شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید.</p>
      <p className="mt-4 text-xs text-gray-500 font-mono bg-red-100 p-2 rounded-md">
        Error Digest: {error.digest || "N/A"}
      </p>
      <Button onClick={() => reset()} className="mt-8 bg-red-600 hover:bg-red-700">
        تلاش مجدد
      </Button>
    </div>
  )
}
