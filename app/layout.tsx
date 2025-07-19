import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SystemLogoutButton from "@/components/system-logout-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "چت‌بات هوشمند",
  description: "سیستم مدیریت چت‌بات هوشمند",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">سیستم مدیریت چت‌بات</h1>
                </div>
                <SystemLogoutButton />
              </div>
            </header>
            <main>{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
