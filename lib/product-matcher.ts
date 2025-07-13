// Enhanced product matching system with 8-stage algorithm
interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  button_text: string
  product_url: string
}

interface MatchResult {
  product: Product
  score: number
  matchType: string
}

// Persian text normalization
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - "۰".charCodeAt(0) + "0".charCodeAt(0)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200C\u200D\s\w]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/).filter((word) => word.length > 2)

  // Remove common stop words
  const stopWords = [
    "برای",
    "است",
    "این",
    "آن",
    "که",
    "را",
    "به",
    "از",
    "در",
    "با",
    "تا",
    "یا",
    "و",
    "هم",
    "نیز",
    "چه",
    "کی",
    "چی",
    "کجا",
    "چرا",
    "چگونه",
    "کدام",
    "هر",
    "همه",
    "بعضی",
    "خیلی",
    "زیاد",
    "کم",
    "اندکی",
  ]

  return words.filter((word) => !stopWords.includes(word))
}

// 8-stage matching algorithm
export function findMatchingProducts(userMessage: string, products: Product[]): Product[] {
  if (!products || products.length === 0) return []

  const userKeywords = extractKeywords(userMessage)
  const matches: MatchResult[] = []

  for (const product of products) {
    let score = 0
    let matchType = "none"

    const productName = normalizeText(product.name)
    const productDesc = normalizeText(product.description || "")
    const productKeywords = extractKeywords(`${product.name} ${product.description || ""}`)

    // Stage 1: Direct name match (highest priority)
    if (userKeywords.some((keyword) => productName.includes(keyword))) {
      score += 1000
      matchType = "direct_name"
    }

    // Stage 2: Exact keyword match in name
    const nameWords = productName.split(/\s+/)
    const exactMatches = userKeywords.filter((keyword) => nameWords.some((word) => word === keyword)).length
    score += exactMatches * 500

    // Stage 3: Partial keyword match in name
    const partialMatches = userKeywords.filter((keyword) =>
      nameWords.some((word) => word.includes(keyword) || keyword.includes(word)),
    ).length
    score += partialMatches * 300

    // Stage 4: Description keyword match
    const descMatches = userKeywords.filter((keyword) => productDesc.includes(keyword)).length
    score += descMatches * 200

    // Stage 5: Brand/category detection
    const brandKeywords = ["سامسونگ", "اپل", "شیائومی", "هواوی", "ال جی", "سونی"]
    const categoryKeywords = ["موبایل", "گوشی", "تبلت", "لپ تاپ", "کامپیوتر", "هدفون", "کیبورد", "ماوس"]

    const brandMatch = brandKeywords.some(
      (brand) => userMessage.includes(brand) && (productName.includes(brand) || productDesc.includes(brand)),
    )
    const categoryMatch = categoryKeywords.some(
      (category) =>
        userMessage.includes(category) && (productName.includes(category) || productDesc.includes(category)),
    )

    if (brandMatch) score += 400
    if (categoryMatch) score += 300

    // Stage 6: Price range detection
    const priceRegex = /(\d+)\s*(?:تومان|ریال|درهم)/g
    const userPrices = [...userMessage.matchAll(priceRegex)].map((match) => Number.parseInt(match[1]))
    if (userPrices.length > 0 && product.price) {
      const avgUserPrice = userPrices.reduce((a, b) => a + b, 0) / userPrices.length
      const priceDiff = Math.abs(product.price - avgUserPrice) / avgUserPrice
      if (priceDiff < 0.3) score += 250 // Within 30% price range
    }

    // Stage 7: Semantic similarity
    const commonKeywords = userKeywords.filter((keyword) =>
      productKeywords.some((pk) => pk.includes(keyword) || keyword.includes(pk)),
    ).length
    score += commonKeywords * 150

    // Stage 8: Length and relevance bonus
    if (userKeywords.length > 0) {
      const relevanceRatio = commonKeywords / userKeywords.length
      score += relevanceRatio * 100
    }

    if (score > 50) {
      // Minimum threshold
      matches.push({ product, score, matchType })
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((match) => match.product)
}

// Legacy export for backward compatibility
export const matchProducts = findMatchingProducts
