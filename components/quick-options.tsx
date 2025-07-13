"use client"

import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"

interface QuickOptionsProps {
  options: string[]
  onSelect: (option: string, liked: boolean) => void
  primaryColor: string
}

export default function QuickOptions({ options, onSelect, primaryColor }: QuickOptionsProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set())

  const handleOptionSelect = (option: string, liked: boolean) => {
    setSelectedOptions((prev) => new Set(prev).add(option))
    onSelect(option, liked)
  }

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            selectedOptions.has(option)
              ? "bg-gray-100 border-gray-300"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-xs flex-1 text-right">{option}</span>
          <div className="flex gap-1 mr-2">
            <button
              onClick={() => handleOptionSelect(option, true)}
              disabled={selectedOptions.has(option)}
              className={`p-1 rounded-full transition-colors ${
                selectedOptions.has(option) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
              }`}
              style={{
                backgroundColor: selectedOptions.has(option) ? "#f3f4f6" : "transparent",
              }}
            >
              <ThumbsUp className="h-3 w-3 text-green-600" />
            </button>
            <button
              onClick={() => handleOptionSelect(option, false)}
              disabled={selectedOptions.has(option)}
              className={`p-1 rounded-full transition-colors ${
                selectedOptions.has(option) ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100"
              }`}
              style={{
                backgroundColor: selectedOptions.has(option) ? "#f3f4f6" : "transparent",
              }}
            >
              <ThumbsDown className="h-3 w-3 text-red-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
