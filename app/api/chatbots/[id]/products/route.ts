import { NextResponse } from "next/server"
import { syncChatbotProducts, getChatbotProducts, type ChatbotProduct } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = Number.parseInt(params.id, 10)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const products = await getChatbotProducts(chatbotId)
    return NextResponse.json(products)
  } catch (error) {
    console.error(`[API GET /products] Error fetching products for chatbot ${chatbotId}:`, error)
    return NextResponse.json({ error: "خطا در دریافت محصولات" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const chatbotId = Number.parseInt(params.id, 10)
  if (isNaN(chatbotId)) {
    return NextResponse.json({ error: "شناسه چت‌بات نامعتبر است" }, { status: 400 })
  }

  try {
    const products = (await request.json()) as Partial<ChatbotProduct>[]
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "داده‌های ارسالی باید یک آرایه از محصولات باشد" }, { status: 400 })
    }

    const validProducts = products
      .filter((product) => product.name?.trim())
      .map((product, index) => ({
        chatbot_id: chatbotId,
        name: product.name!.trim(),
        description: product.description?.trim() || null,
        price: product.price || null,
        image_url: product.image_url || null,
        button_text: product.button_text || "خرید",
        secondary_text: product.secondary_text || "جزئیات",
        product_url: product.product_url || null,
        position: index,
      }))

    const updatedProducts = await syncChatbotProducts(chatbotId, validProducts)
    return NextResponse.json(updatedProducts)
  } catch (error) {
    console.error(`[API PUT /products] Error syncing products for chatbot ${chatbotId}:`, error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "خطای داخلی سرور در ذخیره محصولات", details: errorMessage }, { status: 500 })
  }
}
