import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", file.name, file.size, file.type)

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log("File too large:", file.size)
      return NextResponse.json({ error: "File size too large (max 5MB)" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // For Vercel deployment, we'll use a simple base64 approach
    // since file system writes don't persist on serverless
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Create a data URL that can be used directly
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("File processed successfully, size:", base64.length)

    return NextResponse.json({
      success: true,
      url: dataUrl, // Return data URL instead of file path
      filename: file.name,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
