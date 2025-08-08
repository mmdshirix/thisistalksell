import { NextResponse } from "next/server"

export async function GET() {
  // Light-weight health check; does not touch DB (keeps it fast and reliable).
  return NextResponse.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
