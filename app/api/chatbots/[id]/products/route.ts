import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { getChatbotProducts } = await import("@/lib/db")
    const chatbotId = Number.parseInt(params.id)

    if (isNaN(chatbotId)) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه چت‌بات نامعتبر است",
        },
        { status: 400 },
      )
    }

    const result = await getChatbotProducts(chatbotId)

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در دریافت محصولات: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { addChatbotProduct } = await import("@/lib/db")
    const chatbotId = Number.parseInt(params.id)
    const body = await request.json()

    if (isNaN(chatbotId)) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه چت‌بات نامعتبر است",
        },
        { status: 400 },
      )
    }

    const result = await addChatbotProduct(chatbotId, {
      name: body.name,
      description: body.description,
      price: body.price,
      image_url: body.image_url,
      product_url: body.product_url,
    })

    return NextResponse.json(result, {
      status: result.success ? 201 : 500,
    })
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json(
      {
        success: false,
        message: `خطا در اضافه کردن محصول: ${error instanceof Error ? error.message : "خطای نامشخص"}`,
      },
      { status: 500 },
    )
  }
}
