"use client"

import { useState } from "react"

interface EmbeddedOptionsProps {
  text: string
  onOptionSelect: (option: string) => void
  primaryColor: string
}

export default function EmbeddedOptions({ text, onOptionSelect, primaryColor }: EmbeddedOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Parse the text to extract question and options
  const parseTextForOptions = (text: string) => {
    // Look for the pattern: سوال: [question]? followed by numbered options
    const optionsMatch = text.match(/سوال:\s*([^?]+)\?\s*((?:\d+\.\s*[^\n]+\n?)+)/i)

    if (optionsMatch) {
      const question = optionsMatch[1].trim() + "?"
      const optionsText = optionsMatch[2].trim()
      const options = optionsText
        .split(/\d+\.\s*/)
        .filter(Boolean)
        .map((opt) => opt.trim().replace(/\n/g, ""))

      // Remove the question and options from the main text
      const mainText = text
        .replace(optionsMatch[0], "")
        .replace(/لطفاً یکی از گزینه‌ها را انتخاب کنید\.?/i, "")
        .trim()

      return {
        mainText,
        question,
        options: options.length >= 2 ? options : null,
      }
    }

    return {
      mainText: text,
      question: null,
      options: null,
    }
  }

  const { mainText, question, options } = parseTextForOptions(text)

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    onOptionSelect(option)
  }

  // Format text with links (reuse existing logic)
  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className="space-y-3">
      {/* Main text */}
      <div className="space-y-1">{formatTextWithLinks(mainText)}</div>

      {/* Question and options */}
      {question && options && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm font-medium mb-2 text-gray-700">{question}</div>
          <div className="space-y-2">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                className={`w-full text-right p-2 rounded-lg border text-sm transition-all ${
                  selectedOption === option
                    ? "border-green-500 bg-green-50 text-green-700"
                    : selectedOption !== null
                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                style={
                  selectedOption === null && selectedOption !== option
                    ? {
                        borderColor: `${primaryColor}20`,
                        ":hover": {
                          borderColor: primaryColor,
                          backgroundColor: `${primaryColor}10`,
                        },
                      }
                    : {}
                }
              >
                <span className="font-medium text-xs text-gray-500 mr-2">{index + 1}.</span>
                {option}
              </button>
            ))}
          </div>
          {selectedOption && <div className="mt-2 text-xs text-green-600">✓ انتخاب شما ارسال شد</div>}
        </div>
      )}
    </div>
  )
}
