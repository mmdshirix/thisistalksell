import { getSql } from "@/lib/db"
import { NextResponse } from "next/server"
const sql = getSql()

export async function GET() {
  // This is a placeholder. In a real application, you would fetch available models
  // from DeepSeek API or a configuration.
  const models = [
    { id: "deepseek-chat", name: "DeepSeek Chat" },
    { id: "deepseek-coder", name: "DeepSeek Coder" },
    // Add other DeepSeek models if available and relevant
  ]
  return NextResponse.json(models)
}
