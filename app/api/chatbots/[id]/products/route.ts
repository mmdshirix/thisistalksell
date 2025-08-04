import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const products = await sql`SELECT * FROM suggested_products WHERE chatbot_id = ${chatbotId};`
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const { name, description, image_url, link } = await request.json()
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId !== chatbotId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const result = await sql`
      INSERT INTO suggested_products (chatbot_id, name, description, image_url, link)
      VALUES (${chatbotId}, ${name}, ${description}, ${image_url}, ${link})
      RETURNING id;
    `
    return NextResponse.json({ message: "Product added", id: result[0].id })
  } catch (error) {
    console.error("Error adding product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: productId } = params // Assuming 'id' here refers to productId for DELETE
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    // You might want to verify if the product belongs to the chatbotId from the token
    const product = await sql`SELECT chatbot_id FROM suggested_products WHERE id = ${productId};`
    if (product.length === 0 || product[0].chatbot_id !== decoded.chatbotId) {
      return NextResponse.json({ message: "Forbidden or Product not found" }, { status: 403 })
    }

    await sql`DELETE FROM suggested_products WHERE id = ${productId};`
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
