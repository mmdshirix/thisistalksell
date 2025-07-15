// Enhanced product matching system with 8-stage algorithm and intent detection
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
    "سلام",
    "درود",
    "ممنون",
    "متشکرم",
    "خداحافظ",
  ]

  return words.filter((word) => !stopWords.includes(word))
}

// Detect purchase intent in user message
function detectPurchaseIntent(userMessage: string): boolean {
  const normalized = normalizeText(userMessage)

  // Purchase intent keywords
  const purchaseKeywords = [
    "خرید",
    "بخرم",
    "میخوام",
    "می‌خوام",
    "میخواهم",
    "می‌خواهم",
    "نیاز",
    "لازم",
    "قیمت",
    "هزینه",
    "تومان",
    "ریال",
    "درهم",
    "پول",
    "فروش",
    "خریدن",
    "تهیه",
    "سفارش",
    "خرید",
    "پیشنهاد",
    "توصیه",
    "بهترین",
    "مناسب",
    "ارزان",
    "گران",
    "قیمت",
    "کیفیت",
    "برند",
    "مدل",
    "نوع",
    "انتخاب",
    "مقایسه",
    "تفاوت",
    "ویژگی",
    "مشخصات",
    "کدام",
    "کدوم",
    "چی",
    "چه",
    "محصول",
    "کالا",
    "جنس",
    "اجناس",
  ]

  // Product category keywords
  const productKeywords = [
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
    "کفش",
    "لباس",
    "کتاب",
    "بازی",
    "اسباب‌بازی",
    "لوازم",
    "وسیله",
    "دستگاه",
    "ابزار",
  ]

  // Check for purchase intent
  const hasPurchaseIntent = purchaseKeywords.some((keyword) => normalized.includes(keyword))
  const hasProductMention = productKeywords.some((keyword) => normalized.includes(keyword))

  // Question patterns that indicate shopping intent
  const questionPatterns = [
    /چه.*بخرم/,
    /کدام.*بهتر/,
    /بهترین.*چیه/,
    /پیشنهاد.*می.*دی/,
    /توصیه.*می.*کنی/,
    /قیمت.*چقدر/,
    /چند.*تومان/,
    /کجا.*بخرم/,
    /چطور.*تهیه/,
  ]

  const hasQuestionPattern = questionPatterns.some((pattern) => pattern.test(normalized))

  return hasPurchaseIntent || (hasProductMention && hasQuestionPattern)
}

// Enhanced 8-stage matching algorithm with intent detection
export function findMatchingProducts(userMessage: string, products: Product[]): Product[] {
  if (!products || products.length === 0) return []

  // First check if user has purchase intent
  if (!detectPurchaseIntent(userMessage)) {
    console.log("No purchase intent detected, skipping product suggestions")
    return []
  }

  const userKeywords = extractKeywords(userMessage)
  if (userKeywords.length === 0) {
    console.log("No meaningful keywords found")
    return []
  }

  const matches: MatchResult[] = []

  for (const product of products) {
    let score = 0
    let matchType = "none"

    const productName = normalizeText(product.name)
    const productDesc = normalizeText(product.description || "")
    const productKeywords = extractKeywords(`${product.name} ${product.description || ""}`)

    // Stage 1: Direct exact name match (highest priority)
    const exactNameMatch = userKeywords.some(
      (keyword) => productName === keyword || (productName.includes(keyword) && keyword.length > 3),
    )
    if (exactNameMatch) {
      score += 2000
      matchType = "exact_name"
    }

    // Stage 2: Brand exact match
    const brandKeywords = ["سامسونگ", "اپل", "شیائومی", "هواوی", "ال‌جی", "سونی", "ایسوس", "اچ‌پی", "دل"]
    const brandMatch = brandKeywords.find(
      (brand) => userMessage.includes(brand) && (productName.includes(brand) || productDesc.includes(brand)),
    )
    if (brandMatch) {
      score += 1500
      matchType = "brand_match"
    }

    // Stage 3: Category exact match
    const categoryKeywords = ["موبایل", "گوشی", "تبلت", "لپ‌تاپ", "کامپیوتر", "هدفون", "کیبورد", "ماوس"]
    const categoryMatch = categoryKeywords.find(
      (category) =>
        userMessage.includes(category) && (productName.includes(category) || productDesc.includes(category)),
    )
    if (categoryMatch) {
      score += 1200
      matchType = "category_match"
    }

    // Stage 4: Multiple keyword match in name
    const nameWords = productName.split(/\s+/)
    const keywordMatches = userKeywords.filter((keyword) =>
      nameWords.some((word) => word.includes(keyword) && keyword.length > 2),
    ).length

    if (keywordMatches >= 2) {
      score += keywordMatches * 800
      matchType = "multi_keyword"
    } else if (keywordMatches === 1) {
      score += 400
    }

    // Stage 5: Description relevance
    const descMatches = userKeywords.filter((keyword) => productDesc.includes(keyword) && keyword.length > 2).length
    score += descMatches * 300

    // Stage 6: Price range detection and matching
    const priceRegex = /(\d+)\s*(?:تومان|ریال|درهم|هزار|میلیون)/g
    const userPrices = [...userMessage.matchAll(priceRegex)].map((match) => {
      let price = Number.parseInt(match[1])
      if (match[0].includes("هزار")) price *= 1000
      if (match[0].includes("میلیون")) price *= 1000000
      return price
    })

    if (userPrices.length > 0 && product.price) {
      const avgUserPrice = userPrices.reduce((a, b) => a + b, 0) / userPrices.length
      const priceDiff = Math.abs(product.price - avgUserPrice) / Math.max(avgUserPrice, product.price)
      if (priceDiff < 0.2)
        score += 600 // Within 20% price range
      else if (priceDiff < 0.5) score += 300 // Within 50% price range
    }

    // Stage 7: Semantic similarity boost
    const commonKeywords = userKeywords.filter((keyword) =>
      productKeywords.some((pk) => pk.includes(keyword) || keyword.includes(pk)),
    ).length
    score += commonKeywords * 200

    // Stage 8: Length and context relevance
    if (userKeywords.length > 0) {
      const relevanceRatio = (keywordMatches + descMatches + commonKeywords) / userKeywords.length
      score += relevanceRatio * 150
    }

    // Higher threshold for better precision
    if (score >= 400) {
      // Increased from 50 to 400
      matches.push({ product, score, matchType })
    }
  }

  // Sort by score and return top 1-3 matches
  const sortedMatches = matches.sort((a, b) => b.score - a.score).slice(0, 3) // Maximum 3 products

  // Additional filtering: only return if we have high-confidence matches
  const highConfidenceMatches = sortedMatches.filter((match) => match.score >= 800)

  if (highConfidenceMatches.length > 0) {
    console.log(
      "High confidence matches found:",
      highConfidenceMatches.map((m) => ({
        name: m.product.name,
        score: m.score,
        type: m.matchType,
      })),
    )
    return highConfidenceMatches.map((match) => match.product)
  }

  // If no high confidence matches, return medium confidence matches (but max 2)
  const mediumConfidenceMatches = sortedMatches.filter((match) => match.score >= 600).slice(0, 2)

  if (mediumConfidenceMatches.length > 0) {
    console.log(
      "Medium confidence matches found:",
      mediumConfidenceMatches.map((m) => ({
        name: m.product.name,
        score: m.score,
        type: m.matchType,
      })),
    )
    return mediumConfidenceMatches.map((match) => match.product)
  }

  // If still no good matches, return only the best match if it's above minimum threshold
  if (sortedMatches.length > 0 && sortedMatches[0].score >= 400) {
    console.log("Single best match found:", {
      name: sortedMatches[0].product.name,
      score: sortedMatches[0].score,
      type: sortedMatches[0].matchType,
    })
    return [sortedMatches[0].product]
  }

  console.log("No suitable product matches found")
  return []
}

// Legacy export for backward compatibility
export const matchProducts = findMatchingProducts
