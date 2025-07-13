"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ExternalLink } from "lucide-react"

interface ProductSuggestionCardProps {
  product: {
    id: number
    name: string
    description: string
    price: number
    image_url: string
    button_text: string
    product_url: string
  }
  isCompact?: boolean
}

export function ProductSuggestionCard({ product, isCompact = false }: ProductSuggestionCardProps) {
  const handleProductClick = () => {
    if (product.product_url) {
      window.open(product.product_url, "_blank", "noopener,noreferrer")
    }
  }

  if (isCompact) {
    return (
      <div
        className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all duration-200 cursor-pointer group"
        onClick={handleProductClick}
      >
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src={product.image_url || "/placeholder.svg?height=48&width=48"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=48&width=48&text=محصول"
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-between">
              {product.price && (
                <span className="text-xs font-bold text-green-600">
                  {new Intl.NumberFormat("fa-IR").format(product.price)} تومان
                </span>
              )}
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleProductClick}
    >
      <div className="relative">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg?height=200&width=300"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=300&text=محصول"
            }}
          />
        </div>
        <Badge className="absolute top-2 right-2 bg-green-500 text-white">
          <ShoppingCart className="w-3 h-3 ml-1" />
          موجود
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        {product.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>}
        <div className="flex items-center justify-between">
          {product.price && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat("fa-IR").format(product.price)}
              </span>
              <span className="text-sm text-gray-500">تومان</span>
            </div>
          )}
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            {product.button_text || "خرید"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { ProductSuggestionCard as default }
