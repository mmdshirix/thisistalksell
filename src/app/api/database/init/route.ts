export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { initializeDatabase, createCompleteSampleChatbot } from "@/lib/db"

export async function GET() {
  try {
    const result = await initializeDatabase()
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Database init error: ${String(error?.message || error)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // First initialize the database structure
    const initResult = await initializeDatabase()
    if (!initResult.success) {
      return NextResponse.json(initResult, { status: 500 })
    }

    // Then create a complete sample chatbot
    const sampleResult = await createCompleteSampleChatbot()
    if (!sampleResult.success) {
      return NextResponse.json(sampleResult, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized and sample chatbot created successfully",
      sampleChatbot: sampleResult.chatbot,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Database setup error: ${String(error?.message || error)}`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}
