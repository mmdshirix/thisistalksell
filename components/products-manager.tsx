"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, MoveUp, MoveDown, Upload, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { ChatbotProduct } from "@/lib/db"

interface ProductsManagerProps {
  products: Partial<ChatbotProduct>[]
  setProducts: React.Dispatch<React.SetStateAction<Partial<ChatbotProduct>[]>>
}

export default function ProductsManager({ products, setProducts }: ProductsManagerProps) {
  const { toast } = useToast()
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [showJsonImport, setShowJsonImport] = useState(false)
  const [jsonInput, setJsonInput] = useState("")

  const addProduct = () => {
    setProducts([...products, { name: "", description: "", price: 0, image_url: "", position: products.length }])
  }

  const updateProduct = (index: number, field: keyof ChatbotProduct, value: any) => {
    setProducts(products.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const moveProduct = (index: number, direction: "up" | "down") => {
    const newProducts = [...products]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newProducts.length) return
    ;[newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]]
    setProducts(newProducts)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({ title: "❌ خطا", description: "لطفاً فقط فایل تصویری انتخاب کنید", variant: "destructive" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "❌ خطا", description: "حجم فایل نباید بیشتر از 5 مگابایت باشد", variant: "destructive" })
      return
    }

    setUploadingIndex(index)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/upload", { method: "POST", body: formData })
      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()
      updateProduct(index, "image_url", data.url)
      toast({ title: "✅ موفقیت", description: "تصویر با موفقیت آپلود شد!" })
    } catch (error) {
      toast({ title: "❌ خطا", description: "خطا در آپلود تصویر", variant: "destructive" })
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleJsonExport = () => {
    const exportData = products.map(({ id, chatbot_id, position, ...product }) => product)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "products.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleJsonImport = () => {
    try {
      if (!jsonInput.trim()) {
        toast({
          title: "❌ خطا",
          description: "لطفاً محتوای JSON را وارد کنید",
          variant: "destructive",
        })
        return
      }

      const parsedProducts = JSON.parse(jsonInput)

      if (!Array.isArray(parsedProducts)) {
        toast({
          title: "❌ خطا",
          description: "فرمت JSON نامعتبر است. باید آرایه‌ای از محصولات باشد.",
          variant: "destructive",
        })
        return
      }

      const validatedProducts = parsedProducts.map((product, index) => ({
        name: String(product.name || ""),
        description: String(product.description || ""),
        image_url: String(product.image_url || ""),
        price: Number(product.price) || 0,
        button_text: String(product.button_text || "خرید"),
        secondary_text: String(product.secondary_text || "جزئیات"),
        product_url: String(product.product_url || ""),
        position: index,
      }))

      setProducts(validatedProducts)
      setJsonInput("")
      setShowJsonImport(false)
      toast({ title: "✅ موفقیت", description: "محصولات با موفقیت از JSON وارد شدند." })
    } catch (error) {
      console.error("JSON Parse Error:", error)
      toast({
        title: "❌ خطا",
        description: "خطا در پردازش JSON. لطفاً فرمت JSON را بررسی کنید.",
        variant: "destructive",
      })
    }
  }

  const sampleJson = `[
  {
    "name": "محصول شماره ۱",
    "description": "توضیحات محصول شماره ۱",
    "image_url": "https://example.com/image1.jpg",
    "price": 150000,
    "button_text": "خرید",
    "secondary_text": "اطلاعات بیشتر",
    "product_url": "https://example.com/product1"
  },
  {
    "name": "محصول شماره ۲",
    "description": "توضیحات محصول شماره ۲",
    "image_url": "https://example.com/image2.jpg",
    "price": 250000,
    "button_text": "افزودن به سبد",
    "secondary_text": "اطلاعات بیشتر",
    "product_url": "https://example.com/product2"
  }
]`

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button type="button" onClick={handleJsonExport} variant="outline" size="sm">
          <Download className="h-4 w-4 ml-2" />
          خروجی JSON
        </Button>
        <Button type="button" onClick={() => setShowJsonImport(!showJsonImport)} variant="outline" size="sm">
          <Upload className="h-4 w-4 ml-2" />
          وارد کردن JSON
        </Button>
      </div>

      {showJsonImport && (
        <div className="border rounded-lg p-4 bg-blue-50/50 space-y-3 mb-4">
          <h4 className="font-medium">وارد کردن محصولات از JSON</h4>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="JSON محصولات را اینجا وارد کنید..."
            rows={8}
            className="font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={handleJsonImport} size="sm">
              وارد کردن
            </Button>
            <Button type="button" onClick={() => setJsonInput(sampleJson)} variant="outline" size="sm">
              نمونه JSON
            </Button>
            <Button type="button" onClick={() => setShowJsonImport(false)} variant="ghost" size="sm">
              انصراف
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نام محصول</Label>
                <Input
                  value={product.name || ""}
                  onChange={(e) => updateProduct(index, "name", e.target.value)}
                  placeholder="مثلا: بسته ویژه"
                />
              </div>
              <div>
                <Label>قیمت (تومان)</Label>
                <Input
                  type="number"
                  value={product.price || ""}
                  onChange={(e) => updateProduct(index, "price", Number(e.target.value))}
                  placeholder="مثلا: 50000"
                />
              </div>
            </div>
            <div>
              <Label>توضیحات</Label>
              <Textarea
                value={product.description || ""}
                onChange={(e) => updateProduct(index, "description", e.target.value)}
                placeholder="توضیحات کوتاه محصول..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>متن دکمه اصلی</Label>
                <Input
                  value={product.button_text || ""}
                  onChange={(e) => updateProduct(index, "button_text", e.target.value)}
                  placeholder="مثلا: خرید آنلاین"
                />
              </div>
              <div>
                <Label>متن دکمه دوم</Label>
                <Input
                  value={product.secondary_text || ""}
                  onChange={(e) => updateProduct(index, "secondary_text", e.target.value)}
                  placeholder="مثلا: مشاهده جزئیات"
                />
              </div>
            </div>
            <div>
              <Label>لینک محصول</Label>
              <Input
                value={product.product_url || ""}
                onChange={(e) => updateProduct(index, "product_url", e.target.value)}
                placeholder="https://example.com/product/1"
              />
            </div>
            <div>
              <Label>تصویر محصول</Label>
              <div className="flex items-center gap-4">
                {product.image_url && (
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name || ""}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center flex-grow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                    className="hidden"
                    id={`file-upload-${index}`}
                    disabled={uploadingIndex === index}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                    disabled={uploadingIndex === index}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingIndex === index ? "در حال آپلود..." : "آپلود تصویر"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => moveProduct(index, "up")} disabled={index === 0}>
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveProduct(index, "down")}
                disabled={index === products.length - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => removeProduct(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" onClick={addProduct} variant="outline" className="w-full bg-transparent">
        <Plus className="ml-2 h-4 w-4" />
        افزودن محصول جدید
      </Button>
      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>هیچ محصولی تعریف نشده است. برای افزودن، روی دکمه بالا کلیک کنید.</p>
        </div>
      )}
    </div>
  )
}
