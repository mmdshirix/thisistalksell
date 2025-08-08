export const dynamic = 'force-dynamic'

export async function GET() {
  // Lightweight health endpoint for Docker HEALTHCHECK (no DB calls here)
  return new Response(
    JSON.stringify({
      ok: true,
      env: {
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL)
      }
    }),
    {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }
  )
}
