interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  product_url: string
  button_text: string
}

// Persian/Farsi product keywords and patterns
const PRODUCT_KEYWORDS = {
  // Electronics
  mobile: ["موبایل", "گوشی", "تلفن", "smartphone", "phone"],
  laptop: ["لپ‌تاپ", "لپتاپ", "نوت‌بوک", "کامپیوتر", "laptop", "notebook"],
  tablet: ["تبلت", "آیپد", "tablet", "ipad"],
  headphone: ["هدفون", "هندزفری", "ایرپاد", "headphone", "earphone", "airpods"],

  // Brands
  samsung: ["سامسونگ", "samsung"],
  apple: ["اپل", "آیفون", "apple", "iphone"],
  xiaomi: ["شیائومی", "xiaomi", "mi"],
  huawei: ["هواوی", "huawei"],

  // Purchase intent
  buy: ["خرید", "بخرم", "میخوام", "می‌خوام", "نیاز", "لازم"],
  price: ["قیمت", "هزینه", "تومان", "ریال", "پول", "ارزان", "گران"],
  recommend: ["پیشنهاد", "توصیه", "بهترین", "مناسب", "کیفیت"],
}

// Purchase intent detection
function hasStrongPurchaseIntent(message: string): boolean {
  const normalized = message.toLowerCase()

  const intentPatterns = [
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

  const hasPattern = intentPatterns.some((pattern) => pattern.test(normalized))
  const hasBuyKeywords = PRODUCT_KEYWORDS.buy.some((keyword) => normalized.includes(keyword))
  const hasPriceKeywords = PRODUCT_KEYWORDS.price.some((keyword) => normalized.includes(keyword))

  return hasPattern || (hasBuyKeywords && hasPriceKeywords)
}

// Product matching with scoring
function scoreProductRelevance(product: Product, message: string): number {
  const normalized = message.toLowerCase()
  const productName = product.name.toLowerCase()
  const productDesc = product.description.toLowerCase()

  let score = 0

  // Direct name match (highest score)
  if (normalized.includes(productName) || productName.includes(normalized.split(" ")[0])) {
    score += 100
  }

  // Category matching
  Object.entries(PRODUCT_KEYWORDS).forEach(([category, keywords]) => {
    if (category === "buy" || category === "price" || category === "recommend") return

    const messageHasKeyword = keywords.some((keyword) => normalized.includes(keyword))
    const productHasKeyword = keywords.some((keyword) => productName.includes(keyword) || productDesc.includes(keyword))

    if (messageHasKeyword && productHasKeyword) {
      score += 50
    }
  })

  // Description relevance
  const messageWords = normalized.split(" ").filter((word) => word.length > 2)
  messageWords.forEach((word) => {
    if (productDesc.includes(word) || productName.includes(word)) {
      score += 10
    }
  })

  // Price consideration (if user mentions price, prefer mid-range products)
  const mentionsPrice = PRODUCT_KEYWORDS.price.some((keyword) => normalized.includes(keyword))
  if (mentionsPrice && product.price > 0) {
    // Prefer products in reasonable price range
    if (product.price >= 1000000 && product.price <= 10000000) {
      score += 20
    }
  }

  return score
}

export function findMatchingProducts(message: string, products: Product[]): Product[] {
  // Only suggest products if there's strong purchase intent
  if (!hasStrongPurchaseIntent(message)) {
    return []
  }

  // Score all products
  const scoredProducts = products
    .map((product) => ({
      product,
      score: scoreProductRelevance(product, message),
    }))
    .filter((item) => item.score > 20) // Minimum relevance threshold
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .slice(0, 3) // Maximum 3 suggestions

  return scoredProducts.map((item) => item.product)
}

// Export for use in other components
export { hasStrongPurchaseIntent, scoreProductRelevance }
