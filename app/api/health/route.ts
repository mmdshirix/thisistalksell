import { NextResponse } from "next/server"

export async function GET() {
  // Fast health: confirm server is up; don’t block on DB here.
  return NextResponse.json(
    {
      ok: true,
      time: new Date().toISOString(),
      env: {
        databaseUrl: Boolean(process.env.DATABASE_URL),
      },
    },
    { status: 200 }
  )
}
