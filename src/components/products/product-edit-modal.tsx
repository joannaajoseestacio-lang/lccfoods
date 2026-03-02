"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/products/product-form"
import type { Product } from "@/lib/products-data"

interface ProductEditModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
}

export function ProductEditModal({ product, open, onOpenChange, onSave }: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({})

  useEffect(() => {
    if (product) {
      setFormData({ ...product })
    }
  }, [product])

  if (!product) return null

  function handleSubmit() {
    if (!formData.name || !formData.category) return

    onSave({
      ...product!,
      name: formData.name,
      description: formData.description || "",
      price: formData.price || "0",
      category: formData.category,
      status: formData.status || "available",
      stock: formData.stock || 0,
      sku: formData.sku || "",
      image: formData.image || "",
    })

    onOpenChange(false)
  }

  const isValid = formData.name && formData.category

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the details for {product.name}.
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={formData} onChange={setFormData} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
