import { NextResponse } from "next/server"
// import { JSDOM } from 'jsdom'; // JSDOM might not work in Edge runtime
// import TurndownService from 'turndown'; // TurndownService might not work in Edge runtime

export async function POST(req: Request) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    // This is a simplified example. Real-world scraping needs robust libraries
    // like Cheerio or Puppeteer, which might not be suitable for Edge functions.
    // For now, we'll just fetch and return raw text or a very basic markdown.
    const response = await fetch(url)
    const html = await response.text()

    // Basic text extraction (not full markdown conversion without a library)
    // You would typically use a library like 'turndown' here, but it might not be edge-compatible.
    // For demonstration, we'll just return a simplified text representation.
    const textContent = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    return NextResponse.json({ markdown: textContent.slice(0, 1000) + "..." }) // Return a snippet
  } catch (error) {
    console.error("Error scraping website:", error)
    return NextResponse.json({ error: "Failed to scrape website" }, { status: 500 })
  }
}
