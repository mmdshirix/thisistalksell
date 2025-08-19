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

// Ultra-fast matching algorithm with higher thresholds
export function findMatchingProducts(userMessage: string, products: Product[]): Product[] {
  if (!userMessage || !products || products.length === 0) {
    return []
  }

  const message = userMessage.toLowerCase().trim()

  // Keywords that indicate strong purchase intent
  const purchaseKeywords = [
    "خرید",
    "بخرم",
    "می‌خوام",
    "میخوام",
    "نیاز دارم",
    "لازم دارم",
    "قیمت",
    "چقدر",
    "هزینه",
    "تومان",
    "پول",
    "فروش",
    "محصول",
    "کالا",
    "جنس",
    "چیز",
  ]

  // Check if user has purchase intent
  const hasPurchaseIntent = purchaseKeywords.some((keyword) => message.includes(keyword))

  if (!hasPurchaseIntent) {
    return []
  }

  const matchedProducts: Array<{ product: Product; score: number }> = []

  products.forEach((product) => {
    let score = 0
    const productName = product.name.toLowerCase()
    const productDesc = product.description?.toLowerCase() || ""

    // Exact name match gets highest score
    if (message.includes(productName)) {
      score += 10
    }

    // Partial name match
    const nameWords = productName.split(" ")
    nameWords.forEach((word) => {
      if (word.length > 2 && message.includes(word)) {
        score += 5
      }
    })

    // Description match
    const descWords = productDesc.split(" ")
    descWords.forEach((word) => {
      if (word.length > 3 && message.includes(word)) {
        score += 2
      }
    })

    // Category/type matching (basic)
    const categories = ["لباس", "کفش", "کیف", "عطر", "لوازم", "گوشی", "لپ‌تاپ", "کتاب"]
    categories.forEach((category) => {
      if (message.includes(category) && (productName.includes(category) || productDesc.includes(category))) {
        score += 3
      }
    })

    if (score > 0) {
      matchedProducts.push({ product, score })
    }
  })

  // Sort by score and return top matches
  return matchedProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) // Max 3 products
    .map((item) => item.product)
}

// Legacy export for backward compatibility
export const matchProducts = findMatchingProducts
