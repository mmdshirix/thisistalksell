import { NextResponse } from "next/server"

// Return static DeepSeek model list; no DB usage at import-time
export async function GET() {
  const models = [
    { id: "deepseek-chat", name: "DeepSeek Chat" },
    { id: "deepseek-coder", name: "DeepSeek Coder" },
  ]
  return NextResponse.json(models)
}
