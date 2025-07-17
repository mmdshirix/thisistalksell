import { type NextRequest, NextResponse } from "next/server"
import { syncChatbotProducts, getChatbotProducts } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const products = await getChatbotProducts(chatbotId)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "خطا در دریافت محصولات" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
    }

    const { products } = await request.json()

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "فرمت محصولات نامعتبر است" }, { status: 400 })
    }

    const savedProducts = await syncChatbotProducts(chatbotId, products)
    return NextResponse.json(savedProducts)
  } catch (error) {
    console.error("Error saving products:", error)
    return NextResponse.json({ error: "خطا در ذخیره محصولات" }, { status: 500 })
  }
}
