"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoreIcon as Products } from "lucide-react"
import { Store, TrendingUp, ShoppingBag } from "lucide-react"

interface Product {
  id: string
  name: string
  description?: string
  price?: number
  image_url?: string
  product_url?: string
  button_text?: string
}

interface ChatbotFormProps {
  onSubmit: (values: any) => void
  isLoading: boolean
  initialData?: any
}

export default function ChatbotForm({ onSubmit, isLoading, initialData }: ChatbotFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [seed, setSeed] = useState(initialData?.seed || "")
  const [temperature, setTemperature] = useState(initialData?.temperature || 0.7)
  const [maxTokens, setMaxTokens] = useState(initialData?.max_tokens || 200)
  const [isStreaming, setIsStreaming] = useState(initialData?.is_streaming || false)
  const [products, setProducts] = useState<Product[]>(initialData?.products || [])

  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      toast({
        title: "خطا",
        description: "نام چت‌بات الزامی است",
        variant: "destructive",
      })
      return
    }

    if (typeof onSubmit === "function") {
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        seed: seed.trim(),
        temperature,
        maxTokens,
        isStreaming,
        products,
      })
    } else {
      toast({
        title: "خطا",
        description: "خطا در ارسال فرم",
        variant: "destructive",
      })
    }
  }

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        price: 0,
        image_url: "",
        product_url: "",
        button_text: "",
      },
    ])
  }

  const updateProduct = (id: string, key: string, value: any) => {
    setProducts(products.map((product) => (product.id === id ? { ...product, [key]: value } : product)))
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ساخت ربات</CardTitle>
        <CardDescription>اطلاعات ربات خود را در این قسمت وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full space-y-4">
            <TabsList>
              <TabsTrigger value="general">عمومی</TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Products className="h-4 w-4" />
                محصولات
              </TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                فروشگاه
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام *</Label>
                  <Input
                    id="name"
                    placeholder="نام ربات"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    placeholder="توضیحات ربات"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Input id="seed" placeholder="Seed" value={seed} onChange={(e) => setSeed(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Slider
                    id="temperature"
                    value={[temperature]}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                  <p className="text-sm text-muted-foreground">مقدار Temperature: {temperature}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    type="number"
                    id="maxTokens"
                    placeholder="Max Tokens"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isStreaming"
                    checked={isStreaming}
                    onCheckedChange={(checked) => setIsStreaming(checked)}
                  />
                  <Label htmlFor="isStreaming">Streaming</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="products" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">محصولات</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                    افزودن محصول
                  </Button>
                </div>
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">هنوز محصولی اضافه نشده است.</p>
                ) : (
                  <Accordion type="multiple">
                    {products.map((product) => (
                      <AccordionItem value={product.id} key={product.id}>
                        <AccordionTrigger>{product.name || "محصول جدید"}</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`name-${product.id}`}>نام</Label>
                                <Input
                                  type="text"
                                  id={`name-${product.id}`}
                                  placeholder="نام محصول"
                                  value={product.name}
                                  onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`price-${product.id}`}>قیمت</Label>
                                <Input
                                  type="number"
                                  id={`price-${product.id}`}
                                  placeholder="قیمت محصول"
                                  value={product.price}
                                  onChange={(e) => updateProduct(product.id, "price", Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`description-${product.id}`}>توضیحات</Label>
                              <Textarea
                                id={`description-${product.id}`}
                                placeholder="توضیحات محصول"
                                value={product.description}
                                onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`image_url-${product.id}`}>تصویر</Label>
                              <Input
                                type="text"
                                id={`image_url-${product.id}`}
                                placeholder="آدرس تصویر محصول"
                                value={product.image_url}
                                onChange={(e) => updateProduct(product.id, "image_url", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`product_url-${product.id}`}>لینک محصول</Label>
                              <Input
                                type="text"
                                id={`product_url-${product.id}`}
                                placeholder="آدرس صفحه محصول"
                                value={product.product_url}
                                onChange={(e) => updateProduct(product.id, "product_url", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`button_text-${product.id}`}>متن دکمه</Label>
                              <Input
                                type="text"
                                id={`button_text-${product.id}`}
                                placeholder="متن دکمه محصول"
                                value={product.button_text}
                                onChange={(e) => updateProduct(product.id, "button_text", e.target.value)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeProduct(product.id)}
                            >
                              حذف محصول
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </TabsContent>
            <TabsContent value="store" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">محصولات پرطرفدار فروشگاه</h3>
                  <p className="text-sm text-gray-500">حداکثر 10 محصول برتر</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 10).map((product, index) => (
                    <div
                      key={product.id}
                      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Badge for top products */}
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                          {index === 0 ? "🏆 برتر" : index === 1 ? "🥈 دوم" : "🥉 سوم"}
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
                        {product.image_url ? (
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              const fallback = target.parentElement?.querySelector(".fallback-icon") as HTMLElement
                              if (fallback) fallback.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <div className="fallback-icon w-full h-full absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {product.name}
                        </h4>

                        {product.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>
                        )}

                        {/* Price */}
                        {product.price && (
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">
                              {product.price.toLocaleString()}
                              <span className="text-xs text-gray-500 mr-1">تومان</span>
                            </span>
                            <div className="flex items-center text-xs text-green-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              پرفروش
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          type="button"
                          className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105 font-medium shadow-md"
                          onClick={() => {
                            if (product.product_url) {
                              window.open(product.product_url, "_blank")
                            }
                          }}
                        >
                          {product.button_text || "مشاهده محصول"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200">
                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">هنوز محصولی اضافه نشده</h3>
                    <p className="text-gray-500 mb-4">برای نمایش فروشگاه، ابتدا محصولات را در تب محصولات اضافه کنید</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
          {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          ذخیره
        </Button>
      </CardFooter>
    </Card>
  )
}
