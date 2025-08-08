import { NextResponse } from "next/server"

// Avoid static optimization; always evaluate at runtime
export const dynamic = "force-dynamic"

export async function GET() {
  // Minimal health payload. We avoid DB connection here to keep health fast.
  // You can enrich this to ping the DB if desired.
  const hasDbUrl = Boolean(process.env.DATABASE_URL)
  return NextResponse.json(
    {
      ok: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseUrlPresent: hasDbUrl
    },
    { status: 200 }
  )
}
