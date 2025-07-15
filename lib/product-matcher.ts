// Enhanced product matching system with stricter criteria and faster processing
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

// Persian text normalization - optimized for speed
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

// Extract keywords - faster implementation
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/).filter((word) => word.length > 2)

  // Optimized stop words list
  const stopWords = new Set([
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
    "سلام",
    "درود",
    "ممنون",
    "متشکرم",
    "خداحافظ",
  ])

  return words.filter((word) => !stopWords.has(word))
}

// Stricter purchase intent detection
function detectStrictPurchaseIntent(userMessage: string): boolean {
  const normalized = normalizeText(userMessage)

  // High-confidence purchase keywords
  const strongPurchaseKeywords = [
    "خرید",
    "بخرم",
    "میخوام",
    "می‌خوام",
    "میخواهم",
    "می‌خواهم",
    "سفارش",
    "تهیه",
    "پیشنهاد",
    "توصیه",
    "بهترین",
    "مناسب",
    "قیمت",
    "هزینه",
    "تومان",
    "ریال",
    "پول",
    "فروش",
  ]

  // Specific product categories
  const productCategories = [
    "موبایل",
    "گوشی",
    "تبلت",
    "لپ‌تاپ",
    "لپتاپ",
    "کامپیوتر",
    "هدفون",
    "کیبورد",
    "ماوس",
    "مانیتور",
    "تلویزیون",
    "ساعت",
  ]

  // Brand names
  const brands = ["سامسونگ", "اپل", "شیائومی", "هواوی", "ال‌جی", "سونی", "ایسوس", "اچ‌پی", "دل", "ایسر", "لنوو"]

  // Direct product mention
  const hasProductMention = normalized.includes("محصول") || normalized.includes("کالا")

  // Strong purchase intent
  const hasStrongIntent = strongPurchaseKeywords.some((keyword) => normalized.includes(keyword))

  // Category or brand mention
  const hasCategoryOrBrand = [...productCategories, ...brands].some((item) => normalized.includes(item))

  // Question patterns indicating shopping intent
  const shoppingPatterns = [
    /چه.*بخرم/,
    /کدام.*بهتر/,
    /بهترین.*چیه/,
    /پیشنهاد.*می.*دی/,
    /توصیه.*می.*کنی/,
    /قیمت.*چقدر/,
    /چند.*تومان/,
    /کجا.*بخرم/,
  ]

  const hasShoppingPattern = shoppingPatterns.some((pattern) => pattern.test(normalized))

  // Stricter criteria: need at least 2 indicators
  const indicators = [hasProductMention, hasStrongIntent, hasCategoryOrBrand, hasShoppingPattern].filter(Boolean).length

  return indicators >= 2
}

// Ultra-fast matching algorithm with higher thresholds
export function findMatchingProducts(userMessage: string, products: Product[]): Product[] {
  if (!products || products.length === 0) return []

  // First check: strict purchase intent
  if (!detectStrictPurchaseIntent(userMessage)) {
    console.log("❌ No strong purchase intent detected")
    return []
  }

  console.log("✅ Strong purchase intent detected, proceeding with matching...")

  const userKeywords = extractKeywords(userMessage)
  if (userKeywords.length === 0) {
    console.log("❌ No meaningful keywords found")
    return []
  }

  const matches: MatchResult[] = []

  for (const product of products) {
    let score = 0
    let matchType = "none"

    const productName = normalizeText(product.name)
    const productDesc = normalizeText(product.description || "")

    // Stage 1: Exact brand/product name match (highest priority)
    const exactMatch = userKeywords.some(
      (keyword) => keyword.length > 3 && (productName.includes(keyword) || keyword.includes(productName.split(" ")[0])),
    )
    if (exactMatch) {
      score += 3000
      matchType = "exact_match"
    }

    // Stage 2: Brand exact match
    const brands = ["سامسونگ", "اپل", "شیائومی", "هواوی", "ال‌جی", "سونی", "ایسوس"]
    const brandMatch = brands.find((brand) => userMessage.includes(brand) && productName.includes(brand))
    if (brandMatch) {
      score += 2500
      matchType = "brand_exact"
    }

    // Stage 3: Category exact match
    const categories = ["موبایل", "گوشی", "تبلت", "لپ‌تاپ", "کامپیوتر", "هدفون"]
    const categoryMatch = categories.find(
      (category) => userMessage.includes(category) && productName.includes(category),
    )
    if (categoryMatch) {
      score += 2000
      matchType = "category_exact"
    }

    // Stage 4: Multiple keyword match
    const nameWords = productName.split(/\s+/)
    const keywordMatches = userKeywords.filter((keyword) =>
      nameWords.some((word) => word.includes(keyword) && keyword.length > 3),
    ).length

    if (keywordMatches >= 2) {
      score += keywordMatches * 1000
      matchType = "multi_keyword"
    }

    // Stage 5: Price range matching (if mentioned)
    const priceRegex = /(\d+)\s*(?:تومان|ریال|هزار|میلیون)/g
    const userPrices = [...userMessage.matchAll(priceRegex)].map((match) => {
      let price = Number.parseInt(match[1])
      if (match[0].includes("هزار")) price *= 1000
      if (match[0].includes("میلیون")) price *= 1000000
      return price
    })

    if (userPrices.length > 0 && product.price) {
      const avgUserPrice = userPrices.reduce((a, b) => a + b, 0) / userPrices.length
      const priceDiff = Math.abs(product.price - avgUserPrice) / Math.max(avgUserPrice, product.price)
      if (priceDiff < 0.15)
        score += 1500 // Very close price match
      else if (priceDiff < 0.3) score += 800 // Close price match
    }

    // Much higher threshold for better precision
    if (score >= 1500) {
      // Increased from 400 to 1500
      matches.push({ product, score, matchType })
    }
  }

  // Sort by score and return top matches
  const sortedMatches = matches.sort((a, b) => b.score - a.score)

  // Only return high-confidence matches
  const highConfidenceMatches = sortedMatches.filter((match) => match.score >= 2500)

  if (highConfidenceMatches.length > 0) {
    console.log(
      "🎯 High confidence matches:",
      highConfidenceMatches.map((m) => ({
        name: m.product.name,
        score: m.score,
        type: m.matchType,
      })),
    )
    return highConfidenceMatches.slice(0, 2).map((match) => match.product) // Max 2 products
  }

  // Medium confidence matches (but very selective)
  const mediumConfidenceMatches = sortedMatches.filter((match) => match.score >= 2000)

  if (mediumConfidenceMatches.length > 0) {
    console.log(
      "⚡ Medium confidence matches:",
      mediumConfidenceMatches.map((m) => ({
        name: m.product.name,
        score: m.score,
        type: m.matchType,
      })),
    )
    return mediumConfidenceMatches.slice(0, 1).map((match) => match.product) // Max 1 product
  }

  console.log("❌ No high-quality matches found")
  return []
}

// Legacy export for backward compatibility
export const matchProducts = findMatchingProducts
