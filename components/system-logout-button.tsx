"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SystemLogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)

    try {
      await fetch("/api/system-logout", {
        method: "POST",
      })

      // هدایت به صفحه لاگین
      router.push("/system-login")
      router.refresh()
    } catch (error) {
      console.error("خطا در خروج:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading} className="gap-2 bg-transparent">
      <LogOut className="h-4 w-4" />
      {loading ? "در حال خروج..." : "خروج از سیستم"}
    </Button>
  )
}
