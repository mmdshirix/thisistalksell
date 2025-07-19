import type React from "react"

// Function to convert text with links, paragraphs, and formatting
export function formatTextWithLinks(text: string, products?: any[]): React.ReactNode {
  if (!text) return text

  // حذف ** و فرمت‌بندی بهتر
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')

  // اضافه کردن لینک‌های محصولات به کلمات کلیدی
  if (products && products.length > 0) {
    products.forEach((product) => {
      if (product.name && product.product_url) {
        // جایگزینی نام محصول با لینک
        const productNameRegex = new RegExp(`\\b${product.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
        formattedText = formattedText.replace(
          productNameRegex,
          `<a href="${product.product_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 font-medium">${product.name}</a>`,
        )
      }
    })
  }

  // Pattern to match URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g
  // Pattern to match markdown links [text](url)
  const markdownLinkPattern = /\[([^\]]+)\]$$([^)]+)$$/g

  // Replace markdown links first
  formattedText = formattedText.replace(markdownLinkPattern, (match, linkText, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 font-medium">${linkText}</a>`
  })

  // Replace plain URLs with clickable links
  formattedText = formattedText.replace(urlPattern, (url) => {
    try {
      const domain = new URL(url).hostname.replace("www.", "")
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 font-medium">${domain}</a>`
    } catch {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200 font-medium">${url}</a>`
    }
  })

  // فرمت‌بندی لیست‌های شماره‌دار
  formattedText = formattedText.replace(
    /(\d+)\.\s\*\*(.*?)\*\*/g,
    '<div class="flex items-start gap-2 my-2"><span class="font-bold text-blue-600 dark:text-blue-400 text-sm">$1.</span><span class="font-semibold text-gray-900 dark:text-white text-sm">$2</span></div>',
  )

  // فرمت‌بندی لیست‌های ساده
  formattedText = formattedText.replace(
    /(\d+)\.\s(.*?)(?=\d+\.|$)/g,
    '<div class="flex items-start gap-2 my-1"><span class="font-bold text-blue-600 dark:text-blue-400 text-sm min-w-[20px]">$1.</span><span class="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">$2</span></div>',
  )

  // تبدیل ایموجی‌ها به span با استایل بهتر
  formattedText = formattedText.replace(/(🌶️|🧄|🌸|🌿|💡|🛒|⭐|🔥|💯|🎉|✨)/g, '<span class="text-lg">$1</span>')

  // Convert line breaks to <br> tags
  formattedText = formattedText.replace(/\n/g, "<br>")

  return <div dangerouslySetInnerHTML={{ __html: formattedText }} className="space-y-1" />
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
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
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
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
            >
              {linkText}
            </a>,
          )
        } else {
          // لینک در حال تایپ است - نمایش به صورت متن آبی بدون لینک
          result.push(
            <span key={`typing-link-${index}`} className="text-blue-600 dark:text-blue-400 font-medium">
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
