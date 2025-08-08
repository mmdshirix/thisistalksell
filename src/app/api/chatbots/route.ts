export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getChatbots, createChatbot } from "@/lib/db"

// Accept JSON and multipart/form-data
async function readBody(req: Request): Promise<Record<string, any>> {
  const contentType = req.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    try {
      const json = await req.json()
      return typeof json === "object" && json !== null ? json : {}
    } catch {
      return {}
    }
  }
  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData()
    const obj: Record<string, any> = {}
    for (const [k, v] of form.entries()) {
      obj[k] = typeof v === "string" ? v : (v as File)
    }
    return obj
  }
  // Fallback
  try {
    const text = await req.text()
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

const createSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    primary_color: z.string().optional(),
    text_color: z.string().optional(),
    background_color: z.string().optional(),
    chat_icon: z.string().optional(),
    position: z.string().optional(),
    margin_x: z.coerce.number().optional(),
    margin_y: z.coerce.number().optional(),
    deepseek_api_key: z.string().optional(),
    welcome_message: z.string().optional(),
    navigation_message: z.string().optional(),
    knowledge_base_text: z.string().optional(),
    knowledge_base_url: z.string().optional(), // allow any string, not forcing URL to avoid 400s from custom values
    store_url: z.string().optional(),
    ai_url: z.string().optional(),
    stats_multiplier: z.coerce.number().optional(),
  })
  .passthrough()

export async function GET() {
  try {
    const bots = await getChatbots()
    return NextResponse.json({ success: true, data: bots }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Read chatbots failed: ${String(error?.message || error)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const raw = await readBody(req)
    const parsed = createSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }
    const d = parsed.data

    const bot = await createChatbot({
      name: d.name,
      primary_color: d.primary_color,
      text_color: d.text_color,
      background_color: d.background_color,
      chat_icon: d.chat_icon,
      position: d.position,
      margin_x: d.margin_x,
      margin_y: d.margin_y,
      deepseek_api_key: d.deepseek_api_key,
      welcome_message: d.welcome_message,
      navigation_message: d.navigation_message,
      knowledge_base_text: d.knowledge_base_text,
      knowledge_base_url: d.knowledge_base_url,
      store_url: d.store_url,
      ai_url: d.ai_url,
      stats_multiplier: d.stats_multiplier,
    })

    return NextResponse.json({ success: true, data: bot }, { status: 201 })
  } catch (error: any) {
    // Surface Postgres error code if present
    const code = error?.code ? ` (code ${error.code})` : ""
    return NextResponse.json(
      {
        success: false,
        message: `Create chatbot failed${code}: ${String(error?.message || error)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}
