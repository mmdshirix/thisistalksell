import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { deleteChatbot } = await import("@/lib/db")
    const chatbot = await deleteChatbot(Number.parseInt(params.id))

    if (!chatbot) {
      return NextResponse.json(
        {
          success: false,
          message: "چت‌بات یافت نشد",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "چت‌بات با موفقیت حذف شد",
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
