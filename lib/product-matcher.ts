// Professional product matching system with strict intent detection
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

// Extract meaningful keywords (minimum 3 characters)
function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/).filter((word) => word.length >= 3)

  // Comprehensive stop words list
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
    "بله",
    "نه",
    "آره",
    "نخیر",
    "باشه",
    "اوکی",
    "حله",
    "چطور",
    "چطوری",
    "خوبی",
    "خوبم",
    "مرسی",
    "دستت",
    "درد",
    "نکنه",
    "عالی",
    "خوب",
    "بد",
    "خیلی",
    "زیاد",
    "کم",
    "اندکی",
    "تقریبا",
    "حدود",
    "شاید",
    "احتمالا",
    "البته",
    "یعنی",
    "مثلا",
    "برای",
    "مثل",
    "شبیه",
    "مانند",
    "همچون",
    "علاوه",
    "ضمن",
    "همچنین",
    "نیز",
    "هم",
    "دیگر",
    "سایر",
    "بقیه",
    "باقی",
    "کل",
    "تمام",
    "همه",
    "هیچ",
    "هیچکس",
    "کسی",
    "کس",
  ]

  return words.filter((word) => !stopWords.includes(word))
}

// Strict purchase intent detection - only for explicit product/purchase mentions
function hasStrictPurchaseIntent(userMessage: string): boolean {
  const normalized = normalizeText(userMessage)

  // Direct purchase verbs - must be present
  const directPurchaseVerbs = [
    "بخرم",
    "خرید",
    "خریدن",
    "تهیه",
    "سفارش",
    "خواستن",
    "میخوام",
    "می‌خوام",
    "میخواهم",
    "می‌خواهم",
  ]

  // Product-specific nouns - must be present
  const productNouns = [
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
    "محصول",
    "کالا",
    "جنس",
    "وسیله",
    "دستگاه",
    "ابزار",
    "لوازم",
  ]

  // Price-related terms
  const priceTerms = ["قیمت", "هزینه", "تومان", "ریال", "درهم", "پول", "ارزان", "گران", "مناسب"]

  // Brand names
  const brands = ["سامسونگ", "اپل", "شیائومی", "هواوی", "ال‌جی", "سونی", "ایسوس", "اچ‌پی", "دل", "لنوو"]

  // Must have at least one from each category for purchase intent
  const hasPurchaseVerb = directPurchaseVerbs.some((verb) => normalized.includes(verb))
  const hasProductNoun = productNouns.some((noun) => normalized.includes(noun))
  const hasPriceTerm = priceTerms.some((term) => normalized.includes(term))
  const hasBrand = brands.some((brand) => normalized.includes(brand))

  // Strict conditions:
  // 1. Must have purchase verb AND product noun, OR
  // 2. Must have product noun AND price term, OR
  // 3. Must have brand AND (purchase verb OR price term)
  return (
    (hasPurchaseVerb && hasProductNoun) ||
    (hasProductNoun && hasPriceTerm) ||
    (hasBrand && (hasPurchaseVerb || hasPriceTerm))
  )
}

// Professional product matching with exact keyword matching
export function findMatchingProducts(userMessage: string, products: Product[]): Product[] {
  if (!products || products.length === 0) return []

  // Strict intent check - no suggestions for greetings or general chat
  if (!hasStrictPurchaseIntent(userMessage)) {
    console.log("No strict purchase intent detected")
    return []
  }

  const userKeywords = extractKeywords(userMessage)
  if (userKeywords.length === 0) {
    console.log("No meaningful keywords extracted")
    return []
  }

  const matches: MatchResult[] = []

  for (const product of products) {
    let score = 0
    let matchType = "none"

    const productName = normalizeText(product.name)
    const productDesc = normalizeText(product.description || "")
    const productKeywords = extractKeywords(`${product.name} ${product.description || ""}`)

    // Stage 1: Exact product name match (highest priority)
    const exactNameMatch = userKeywords.some((keyword) => productName.includes(keyword) && keyword.length >= 4)
    if (exactNameMatch) {
      score += 3000
      matchType = "exact_name"
    }

    // Stage 2: Brand exact match
    const brandKeywords = ["سامسونگ", "اپل", "شیائومی", "هواوی", "ال‌جی", "سونی", "ایسوس", "اچ‌پی", "دل"]
    const userBrands = userKeywords.filter((keyword) => brandKeywords.includes(keyword))
    const productBrands = productKeywords.filter((keyword) => brandKeywords.includes(keyword))

    if (userBrands.length > 0 && productBrands.length > 0) {
      const brandMatch = userBrands.some((brand) => productBrands.includes(brand))
      if (brandMatch) {
        score += 2500
        matchType = "brand_exact"
      }
    }

    // Stage 3: Product category exact match
    const categoryKeywords = ["موبایل", "گوشی", "تبلت", "لپ‌تاپ", "کامپیوتر", "هدفون", "کیبورد", "ماوس"]
    const userCategories = userKeywords.filter((keyword) => categoryKeywords.includes(keyword))
    const productCategories = productKeywords.filter((keyword) => categoryKeywords.includes(keyword))

    if (userCategories.length > 0 && productCategories.length > 0) {
      const categoryMatch = userCategories.some((cat) => productCategories.includes(cat))
      if (categoryMatch) {
        score += 2000
        matchType = "category_exact"
      }
    }

    // Stage 4: Multiple exact keyword matches
    const exactMatches = userKeywords.filter((keyword) =>
      productKeywords.some((pk) => pk === keyword || (pk.includes(keyword) && keyword.length >= 4)),
    ).length

    if (exactMatches >= 2) {
      score += exactMatches * 1000
      matchType = "multi_exact"
    } else if (exactMatches === 1) {
      score += 800
    }

    // Stage 5: Model/specification match
    const modelKeywords = userKeywords.filter((keyword) => /^[a-zA-Z0-9]+$/.test(keyword) && keyword.length >= 3)
    const modelMatches = modelKeywords.filter(
      (model) => productName.includes(model) || productDesc.includes(model),
    ).length

    if (modelMatches > 0) {
      score += modelMatches * 1500
      matchType = "model_match"
    }

    // Only consider products with significant matches
    if (score >= 1500) {
      // Very high threshold
      matches.push({ product, score, matchType })
    }
  }

  // Sort by score and return top matches
  const sortedMatches = matches.sort((a, b) => b.score - a.score)

  // Return 1-3 products based on confidence levels
  if (sortedMatches.length === 0) {
    console.log("No products meet the strict matching criteria")
    return []
  }

  // High confidence: score >= 2500
  const highConfidence = sortedMatches.filter((m) => m.score >= 2500).slice(0, 2)
  if (highConfidence.length > 0) {
    console.log(
      "High confidence matches:",
      highConfidence.map((m) => ({ name: m.product.name, score: m.score })),
    )
    return highConfidence.map((m) => m.product)
  }

  // Medium confidence: score >= 2000
  const mediumConfidence = sortedMatches.filter((m) => m.score >= 2000).slice(0, 2)
  if (mediumConfidence.length > 0) {
    console.log(
      "Medium confidence matches:",
      mediumConfidence.map((m) => ({ name: m.product.name, score: m.score })),
    )
    return mediumConfidence.map((m) => m.product)
  }

  // Low confidence: return only the best match
  console.log("Single best match:", { name: sortedMatches[0].product.name, score: sortedMatches[0].score })
  return [sortedMatches[0].product]
}

// Legacy export for backward compatibility
export const matchProducts = findMatchingProducts
