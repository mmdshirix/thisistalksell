import { NextResponse } from "next/server"
import { sql, testDatabaseConnection } from "@/lib/db"

// GET: diagnostics only (avoid 405)
export async function GET() {
  const result = await testDatabaseConnection()
  if (result.ok) {
    return NextResponse.json({
      ok: true,
      message: "Database connection OK",
      usingEnvVar: result.usingEnvVar,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
    })
  }
  return NextResponse.json(
    {
      ok: false,
      message: `Connection error: ${result.error}`,
      usingEnvVar: result.usingEnvVar,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
    },
    { status: 500 }
  )
}

// POST: idempotent initializer (minimal, does not alter your UI)
export async function POST() {
  try {
    // Create minimal tables if not exist (adjust to your schema as needed).
    await sql`create table if not exists chatbots (
      id serial primary key,
      name text not null,
      description text,
      created_at timestamptz not null default now()
    )`
    await sql`create table if not exists faqs (
      id serial primary key,
      chatbot_id int not null references chatbots(id) on delete cascade,
      question text not null,
      answer text not null
    )`
    await sql`create table if not exists products (
      id serial primary key,
      chatbot_id int not null references chatbots(id) on delete cascade,
      name text not null,
      price numeric,
      metadata jsonb default '{}'::jsonb
    )`
    await sql`create table if not exists chatbot_options (
      id serial primary key,
      chatbot_id int not null references chatbots(id) on delete cascade,
      settings jsonb not null default '{}'::jsonb
    )`

    return NextResponse.json({
      ok: true,
      message: "Initialization completed (idempotent).",
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        message: `Initialization failed: ${String(e?.message || e)}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
