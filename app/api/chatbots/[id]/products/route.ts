import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { getChatbotProducts } = await import("@/lib/db")

    const products = await getChatbotProducts(chatbotId)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const chatbotId = Number.parseInt(params.id)
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID" }, { status: 400 })
    }

    const body = await request.json()
    const { products } = body

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Products must be an array" }, { status: 400 })
    }

    // Dynamic import to avoid build-time issues
    const { syncChatbotProducts } = await import("@/lib/db")

    const updatedProducts = await syncChatbotProducts(chatbotId, products)
    return NextResponse.json(updatedProducts)
  } catch (error) {
    console.error("Error syncing products:", error)
    return NextResponse.json({ error: "Failed to sync products" }, { status: 500 })
  }
}
