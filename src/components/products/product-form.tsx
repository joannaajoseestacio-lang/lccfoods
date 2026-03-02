"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CATEGORIES,
  STATUSES,
  type Product,
  type ProductCategory,
  type ProductStatus,
} from "@/lib/products-data"

interface ProductFormProps {
  product: Partial<Product>
  onChange: (product: Partial<Product>) => void
  disabled?: boolean
}

export function ProductForm({ product, onChange, disabled = false }: ProductFormProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("https://api.lccgatepass.xyz/api/v1/upload/imagekit", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data?.url) {
        onChange({ ...product, image: data.url })
      } else {
        console.error("Upload API did not return URL:", data)
        alert("Upload failed: no URL returned")
      }
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          placeholder="e.g. Chicken Adobo"
          value={product.name || ""}
          onChange={(e) => onChange({ ...product, name: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the dish, ingredients, serving info..."
          value={product.description || ""}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
          disabled={disabled}
          className="min-h-20"
        />
      </div>

      {/* Image upload */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          onChange={handleFileChange}
          disabled={disabled || uploading}
        />
        {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        {product.image && (
          <img src={product.image} alt="Uploaded" className="mt-2 h-24 w-24 object-cover rounded" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">{'Price (₱)'}</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={product.price ?? ""}
            onChange={(e) =>
              onChange({ ...product, price: e.target.value || "0" })
            }
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            placeholder="0"
            value={product.stock ?? ""}
            onChange={(e) =>
              onChange({ ...product, stock: parseInt(e.target.value) || 0 })
            }
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={product.category || ""}
            onValueChange={(value) =>
              onChange({ ...product, category: value as ProductCategory })
            }
            disabled={disabled}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={product.status || ""}
            onValueChange={(value) =>
              onChange({ ...product, status: value as ProductStatus })
            }
            disabled={disabled}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          placeholder="e.g. ADO-2025-001"
          value={product.sku || ""}
          onChange={(e) => onChange({ ...product, sku: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}