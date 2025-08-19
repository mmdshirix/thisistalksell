import React from "react"

// Function to convert text with links, paragraphs, and formatting
export function formatTextWithLinks(text: string): React.ReactNode {
  if (!text) return text

  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g

  // Split text by URLs
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    // Check if this part is a URL
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {part}
        </a>
      )
    }

    // Regular text - preserve line breaks
    return part.split("\n").map((line, lineIndex, array) => (
      <React.Fragment key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < array.length - 1 && <br />}
      </React.Fragment>
    ))
  })
}

// Function to process a single paragraph and convert URLs and markdown links to clickable links
function processParagraphWithLinks(paragraph: string): React.ReactNode[] {
  // Regular expression to match markdown links [text](url) and complete URLs
  const markdownLinkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
  const urlRegex = /(https?:\/\/[^\s]+)/g

  // ابتدا لینک‌های markdown را پردازش کن
  let processedText = paragraph
  const markdownLinks: { text: string; url: string; placeholder: string }[] = []

  let markdownMatch
  while ((markdownMatch = markdownLinkRegex.exec(paragraph)) !== null) {
    const [fullMatch, linkText, url] = markdownMatch
    const placeholder = `__MARKDOWN_LINK_${markdownLinks.length}__`
    markdownLinks.push({ text: linkText, url, placeholder })
    processedText = processedText.replace(fullMatch, placeholder)
  }

  // سپس URL های عادی را پیدا کن
  const urls = processedText.match(urlRegex) || []

  if (urls.length === 0 && markdownLinks.length === 0) {
    // اگر لینکی نیست، متن ساده برگردان
    return [paragraph]
  }

  // تقسیم متن بر اساس لینک‌ها
  const allRegex = new RegExp(
    `(${urlRegex.source}|${markdownLinks.map((link) => link.placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  )
  const parts = processedText.split(allRegex)
  const result: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (part) {
      // بررسی اینکه آیا این قسمت یک placeholder برای markdown link است
      const markdownLink = markdownLinks.find((link) => link.placeholder === part)
      if (markdownLink) {
        result.push(
          <a
            key={`markdown-link-${index}`}
            href={markdownLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 transition-colors font-medium"
          >
            {markdownLink.text}
          </a>,
        )
      }
      // بررسی اینکه آیا این قسمت یک URL عادی است
      else if (urlRegex.test(part)) {
        // بررسی اینکه آیا لینک کامل است یا در حال تایپ
        const isCompleteUrl = isValidUrl(part)

        if (isCompleteUrl) {
          // لینک کامل است
          const linkText = extractLinkText(part, paragraph)
          result.push(
            <a
              key={`link-${index}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors font-medium"
            >
              {linkText}
            </a>,
          )
        } else {
          // لینک در حال تایپ است - نمایش به صورت متن آبی بدون لینک
          result.push(
            <span key={`typing-link-${index}`} className="text-blue-600 font-medium">
              {part}
            </span>,
          )
        }
      } else {
        // این متن عادی است
        result.push(part)
      }
    }
  })

  return result
}

// Function to check if URL is complete and valid
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    // بررسی اینکه آیا URL به نظر کامل می‌رسد
    return url.length > 10 && !url.endsWith("/") && url.includes(".")
  } catch {
    return false
  }
}

// Function to extract meaningful text for a link
function extractLinkText(url: string, fullText: string): string {
  try {
    // سعی در استخراج نام دامنه
    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace("www.", "")

    // بررسی اینکه آیا قبل از لینک کلمه‌ای وجود دارد که بتوان از آن استفاده کرد
    const urlIndex = fullText.indexOf(url)
    if (urlIndex > 0) {
      // متن قبل از لینک را بررسی کن
      const textBefore = fullText.substring(0, urlIndex).trim()
      const words = textBefore.split(/\s+/)
      const lastWords = words.slice(-3).join(" ") // 3 کلمه آخر

      // اگر کلمات مناسبی وجود دارد، از آن‌ها استفاده کن
      if (lastWords && lastWords.length > 2 && lastWords.length < 50) {
        // حذف کلمات رایج که معنی ندارند
        const meaningfulWords = lastWords.replace(/^(در|به|از|برای|روی|با|این|آن|که|را|و|یا)\s+/g, "")
        if (meaningfulWords.length > 2) {
          return meaningfulWords
        }
      }
    }

    // اگر نتوانست متن مناسب پیدا کند، از نام دامنه استفاده کن
    return domain || url
  } catch (error) {
    // اگر URL نامعتبر بود، خود URL را برگردان
    return url
  }
}

// Function to format text with better line breaks and structure
export function formatTextStructure(text: string): React.ReactNode[] {
  if (!text || typeof text !== "string") {
    return [text || ""]
  }

  try {
    // حذف علامت * و فرمت‌بندی اضافی
    const cleanText = text.replace(/\*/g, "").replace(/\s+/g, " ").trim()

    // تقسیم به جملات
    const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim())

    if (sentences.length <= 1) {
      return [cleanText]
    }

    const result: React.ReactNode[] = []

    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim()
      if (trimmedSentence) {
        result.push(
          <span key={`sentence-${index}`} className="block mb-1">
            {trimmedSentence}
            {index < sentences.length - 1 && "."}
          </span>,
        )
      }
    })

    return result
  } catch (error) {
    console.error("Error in formatTextStructure:", error)
    return [text]
  }
}

// Helper function to detect and format phone numbers
export function formatPhoneNumbers(text: string): React.ReactNode {
  const phoneRegex = /((?:\+98|0)?9\d{9})/g
  const parts = text.split(phoneRegex)

  return parts.map((part, index) => {
    if (phoneRegex.test(part)) {
      return (
        <a key={index} href={`tel:${part}`} className="text-green-600 hover:text-green-800 underline">
          {part}
        </a>
      )
    }
    return part
  })
}

// Helper function to format text with both links and phone numbers
export function formatTextComplete(text: string): React.ReactNode {
  if (!text) return text

  // First format URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const phoneRegex = /((?:\+98|0)?9\d{9})/g

  const result: React.ReactNode[] = []
  let lastIndex = 0

  // Find all URLs and phone numbers
  const matches: Array<{ type: "url" | "phone"; match: string; index: number }> = []

  let match
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({ type: "url", match: match[0], index: match.index })
  }

  while ((match = phoneRegex.exec(text)) !== null) {
    matches.push({ type: "phone", match: match[0], index: match.index })
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index)

  matches.forEach((matchObj, index) => {
    // Add text before this match
    if (matchObj.index > lastIndex) {
      const beforeText = text.slice(lastIndex, matchObj.index)
      result.push(
        <React.Fragment key={`text-${index}`}>
          {beforeText.split("\n").map((line, lineIndex, array) => (
            <React.Fragment key={`line-${index}-${lineIndex}`}>
              {line}
              {lineIndex < array.length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>,
      )
    }

    // Add the formatted match
    if (matchObj.type === "url") {
      result.push(
        <a
          key={`url-${index}`}
          href={matchObj.match}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {matchObj.match}
        </a>,
      )
    } else {
      result.push(
        <a
          key={`phone-${index}`}
          href={`tel:${matchObj.match}`}
          className="text-green-600 hover:text-green-800 underline"
        >
          {matchObj.match}
        </a>,
      )
    }

    lastIndex = matchObj.index + matchObj.match.length
  })

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex)
    result.push(
      <React.Fragment key="remaining">
        {remainingText.split("\n").map((line, lineIndex, array) => (
          <React.Fragment key={`remaining-line-${lineIndex}`}>
            {line}
            {lineIndex < array.length - 1 && <br />}
          </React.Fragment>
        ))}
      </React.Fragment>,
    )
  }

  return result.length > 0 ? result : text
}
