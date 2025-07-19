"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"

interface LauncherProps {
  params: {
    id: string
  }
}

export default function LauncherPage({ params }: LauncherProps) {
  const searchParams = useSearchParams()
  const [iframeSrc, setIframeSrc] = useState(`/widget/${params.id}`)

  // This component is now just a simple iframe wrapper.
  // The positioning is handled by the widget-loader script.
  // We keep it in case we want to add launcher-specific logic later.

  return (
    <iframe
      src={iframeSrc}
      className="w-full h-full border-0"
      allow="microphone" // Allow microphone access for voice input
    />
  )
}
