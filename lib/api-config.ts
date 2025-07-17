// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://thisistalksell.liara.run"

// Helper function to build API URLs
export function buildApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path

  // Ensure base URL doesn't end with slash
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL

  return `${baseUrl}/${cleanPath}`
}

// API endpoints
export const API_ENDPOINTS = {
  chatbots: "/api/chatbots",
  chat: "/api/chat",
  tickets: "/api/tickets",
  upload: "/api/upload",
  adminPanel: (id: string) => `/api/admin-panel/${id}`,
  widgetLoader: "/api/widget-loader",
} as const
