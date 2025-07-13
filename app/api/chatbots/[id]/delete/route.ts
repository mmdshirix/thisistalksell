import { deleteChatbot } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    // حذف چت‌بات و تمام داده‌های مرتبط
    const success = await deleteChatbot(chatbotId)

    if (!success) {
      return NextResponse.json({ error: "چت‌بات یافت نشد" }, { status: 404 })
    }

    // Revalidate the home page to update the chatbot list
    revalidatePath("/")

    return NextResponse.json({ success: true, message: "چت‌بات با موفقیت حذف شد" })
  } catch (error) {
    console.error("Error deleting chatbot:", error)
    return NextResponse.json({ error: "خطا در حذف چت‌بات" }, { status: 500 })
  }
}
