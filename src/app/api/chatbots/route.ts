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
    knowledge_base_url: z.string().url().optional(),
    store_url: z.string().url().optional(),
    ai_url: z.string().url().optional(),
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
        message: `Connection error: ${String(error?.message || error)}`,
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
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 })
    }
    const data = parsed.data

    const bot = await createChatbot({
      name: data.name.trim(),
      primary_color: data.primary_color,
      text_color: data.text_color,
      background_color: data.background_color,
      chat_icon: data.chat_icon,
      position: data.position,
      margin_x: data.margin_x,
      margin_y: data.margin_y,
      deepseek_api_key: data.deepseek_api_key,
      welcome_message: data.welcome_message,
      navigation_message: data.navigation_message,
      knowledge_base_text: data.knowledge_base_text,
      knowledge_base_url: data.knowledge_base_url,
      store_url: data.store_url,
      ai_url: data.ai_url,
      stats_multiplier: data.stats_multiplier,
    })

    return NextResponse.json({ success: true, data: bot }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Create chatbot failed: ${String(error?.message || error)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}
