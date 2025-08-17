import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // بررسی فرمت URL
    let validUrl: string
    try {
      validUrl = url.startsWith("http") ? url : `https://${url}`
      new URL(validUrl) // بررسی معتبر بودن URL
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    console.log(`🌐 Scraping website: ${validUrl}`)

    // دریافت محتوای صفحه
    const response = await fetch(validUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fa,en;q=0.9",
      },
      timeout: 10000, // 10 ثانیه timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // استخراج متن از HTML
    const extractedText = extractTextFromHTML(html)

    console.log(`✅ Successfully scraped ${extractedText.length} characters from ${validUrl}`)

    return NextResponse.json({
      success: true,
      text: extractedText,
      url: validUrl,
      length: extractedText.length,
    })
  } catch (error) {
    console.error("❌ Error scraping website:", error)
    return NextResponse.json(
      {
        error: "Failed to scrape website",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function extractTextFromHTML(html: string): string {
  // حذف script و style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")

  // حذف HTML tags
  text = text.replace(/<[^>]*>/g, " ")

  // حذف HTML entities
  text = text.replace(/&nbsp;/g, " ")
  text = text.replace(/&amp;/g, "&")
  text = text.replace(/&lt;/g, "<")
  text = text.replace(/&gt;/g, ">")
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&[a-zA-Z0-9#]+;/g, "")

  // حذف فاصله‌های اضافی
  text = text.replace(/\s+/g, " ")
  text = text.trim()

  // محدود کردن طول متن (حداکثر 5000 کاراکتر)
  if (text.length > 5000) {
    text = text.substring(0, 5000) + "..."
  }

  return text
}
