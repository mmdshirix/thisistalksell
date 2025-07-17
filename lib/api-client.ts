// Generic API client
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://thisistalksell.liara.run"
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path
    const baseUrl = this.baseUrl.endsWith("/") ? this.baseUrl.slice(0, -1) : this.baseUrl
    return `${baseUrl}/${cleanPath}`
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async post<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async put<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.buildUrl(path), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

// Default API client instance
export const apiClient = new ApiClient()
