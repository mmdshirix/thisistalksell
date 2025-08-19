import React from "react"

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/g

// Phone number regex pattern (Iranian format)
const PHONE_REGEX = /(09\d{9}|\+989\d{9})/g

// Email regex pattern
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

export function formatTextWithLinks(text: string): React.ReactNode {
  if (!text) return null

  // Split text by URLs, phone numbers, and emails
  const parts = text.split(/(https?:\/\/[^\s]+|09\d{9}|\+989\d{9}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g)

  return parts.map((part, index) => {
    // Check if it's a URL
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      )
    }

    // Check if it's a phone number
    if (PHONE_REGEX.test(part)) {
      return (
        <a key={index} href={`tel:${part}`} className="text-green-600 hover:text-green-800 underline">
          {part}
        </a>
      )
    }

    // Check if it's an email
    if (EMAIL_REGEX.test(part)) {
      return (
        <a key={index} href={`mailto:${part}`} className="text-purple-600 hover:text-purple-800 underline">
          {part}
        </a>
      )
    }

    // Regular text with line breaks
    return (
      <span key={index}>
        {part.split("\n").map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < part.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    )
  })
}

// Utility function to extract URLs from text
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  return matches || []
}

// Utility function to extract phone numbers from text
export function extractPhoneNumbers(text: string): string[] {
  const matches = text.match(PHONE_REGEX)
  return matches || []
}

// Utility function to extract emails from text
export function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX)
  return matches || []
}

// Utility function to clean text from URLs and special characters
export function cleanText(text: string): string {
  return text.replace(URL_REGEX, "[لینک]").replace(PHONE_REGEX, "[شماره تماس]").replace(EMAIL_REGEX, "[ایمیل]").trim()
}

// Utility function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

// Utility function to highlight search terms in text
export function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm.trim()) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
