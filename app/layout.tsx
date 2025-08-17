import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Next.js Full-Stack App",
  description: "Complete Next.js 14 application with TypeScript and PostgreSQL",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
