import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "پلتفرم چت‌بات",
  description: "پلتفرم مدیریت چت‌بات‌های هوشمند",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet" />
      </head>
      <body className="font-vazir">
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}
