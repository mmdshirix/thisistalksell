import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { deleteChatbot } = await import("@/lib/db")
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const result = await deleteChatbot(id)
    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در حذف چت‌بات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
