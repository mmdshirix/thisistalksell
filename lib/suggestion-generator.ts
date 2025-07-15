// Local suggestion generator for next questions
interface NextSuggestion {
  text: string
  emoji: string
}

// Generate contextual follow-up questions based on user message
export function generateNextSuggestions(userMessage: string, hasProducts: boolean): NextSuggestion[] {
  const normalized = userMessage.toLowerCase()

  // Product-related suggestions
  if (hasProducts) {
    const productSuggestions = [
      { text: "قیمت این محصولات چقدر است؟", emoji: "💰" },
      { text: "گارانتی این محصولات چطور است؟", emoji: "🛡️" },
      { text: "زمان ارسال چقدر طول می‌کشد؟", emoji: "🚚" },
      { text: "آیا تخفیف ویژه‌ای دارید؟", emoji: "🏷️" },
    ]
    return productSuggestions.slice(0, 2)
  }

  // General suggestions based on message content
  if (normalized.includes("سلام") || normalized.includes("درود")) {
    return [
      { text: "محصولات شما را ببینم", emoji: "🛍️" },
      { text: "چه کمکی می‌توانید بکنید؟", emoji: "❓" },
    ]
  }

  if (normalized.includes("قیمت") || normalized.includes("هزینه")) {
    return [
      { text: "آیا امکان پرداخت اقساطی دارید؟", emoji: "💳" },
      { text: "تخفیف‌های ویژه چه هستند؟", emoji: "🎯" },
    ]
  }

  if (normalized.includes("ارسال") || normalized.includes("تحویل")) {
    return [
      { text: "هزینه ارسال چقدر است؟", emoji: "📦" },
      { text: "آیا ارسال رایگان دارید؟", emoji: "🆓" },
    ]
  }

  // Default suggestions
  return [
    { text: "محصولات پیشنهادی شما چیست؟", emoji: "⭐" },
    { text: "چطور می‌توانم سفارش دهم؟", emoji: "📝" },
  ]
}
