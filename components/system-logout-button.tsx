"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

export default function SystemLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/system-logout", { method: "POST" })
      toast.success("خروج موفقیت‌آمیز")
      router.push("/system-login")
      router.refresh()
    } catch (error) {
      toast.error("خطا در خروج از سیستم")
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="w-4 h-4 mr-2" />
      خروج
    </Button>
  )
}
