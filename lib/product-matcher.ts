interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  product_url: string
  button_text: string
}

interface SuggestedProduct extends Product {}

// Keywords that indicate purchase intent
const PURCHASE_INTENT_KEYWORDS = [
  "خرید",
  "بخرم",
  "سفارش",
  "قیمت",
  "هزینه",
  "تومان",
  "ریال",
  "پول",
  "فروش",
  "موجود",
  "آماده",
  "تحویل",
  "ارسال",
  "پست",
  "پیک",
  "تخفیف",
  "ارزان",
  "گران",
  "مناسب",
  "بهترین",
  "کیفیت",
  "برند",
  "مارک",
  "اصل",
  "اورجینال",
  "ضمانت",
  "گارانتی",
]

// Product category keywords
const CATEGORY_KEYWORDS = {
  electronics: ["موبایل", "گوشی", "تبلت", "لپ‌تاپ", "کامپیوتر", "هدفون", "ساعت", "الکترونیک"],
  clothing: ["لباس", "پیراهن", "شلوار", "کفش", "کیف", "عینک", "ساعت", "پوشاک"],
  home: ["خانه", "آشپزخانه", "حمام", "اتاق", "مبل", "فرش", "لوازم"],
  beauty: ["آرایش", "زیبایی", "کرم", "شامپو", "عطر", "لوازم"],
  food: ["غذا", "خوراکی", "نوشیدنی", "میوه", "سبزی", "گوشت"],
  books: ["کتاب", "مجله", "روزنامه", "مطالعه", "درس"],
  sports: ["ورزش", "فوتبال", "بسکتبال", "دوچرخه", "ورزشی"],
  health: ["سلامت", "دارو", "ویتامین", "مکمل", "پزشکی"],
}

export function findMatchingProducts(userMessage: string, products: Product[]): SuggestedProduct[] {
  if (!userMessage || !products || products.length === 0) {
    return []
  }

  const message = userMessage.toLowerCase().trim()

  // Check if user has purchase intent
  const hasPurchaseIntent = PURCHASE_INTENT_KEYWORDS.some((keyword) => message.includes(keyword))

  // If no purchase intent, return empty array (be more strict)
  if (!hasPurchaseIntent) {
    return []
  }

  const scoredProducts: Array<{ product: Product; score: number }> = []

  products.forEach((product) => {
    let score = 0
    const productText = `${product.name} ${product.description}`.toLowerCase()

    // Direct name matching (highest priority)
    const productWords = product.name.toLowerCase().split(" ")
    const messageWords = message.split(" ")

    productWords.forEach((productWord) => {
      if (productWord.length > 2) {
        // Ignore very short words
        messageWords.forEach((messageWord) => {
          if (messageWord.includes(productWord) || productWord.includes(messageWord)) {
            score += 10
          }
        })
      }
    })

    // Description matching
    const descWords = product.description.toLowerCase().split(" ")
    descWords.forEach((descWord) => {
      if (descWord.length > 3) {
        messageWords.forEach((messageWord) => {
          if (messageWord.includes(descWord) || descWord.includes(messageWord)) {
            score += 3
          }
        })
      }
    })

    // Category matching
    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach((keyword) => {
        if (message.includes(keyword) && productText.includes(keyword)) {
          score += 5
        }
      })
    })

    // Price range matching
    if (message.includes("ارزان") || message.includes("کم")) {
      if (product.price < 500000) score += 2
    }
    if (message.includes("گران") || message.includes("لوکس") || message.includes("پریمیوم")) {
      if (product.price > 1000000) score += 2
    }

    if (score > 0) {
      scoredProducts.push({ product, score })
    }
  })

  // Sort by score and return top 3
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.product)
}

// Helper function to detect if message has strong purchase intent
export function hasPurchaseIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return PURCHASE_INTENT_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
}

// Helper function to extract price range from message
export function extractPriceRange(message: string): { min?: number; max?: number } {
  const priceRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:تومان|ریال)/g
  const matches = [...message.matchAll(priceRegex)]

  if (matches.length === 0) return {}

  const prices = matches.map((match) => Number.parseInt(match[1].replace(/,/g, ""))).sort((a, b) => a - b)

  return {
    min: prices[0],
    max: prices[prices.length - 1],
  }
}
