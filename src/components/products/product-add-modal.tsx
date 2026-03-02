"use client"

import { useState } from "react"
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

interface ProductAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (product: Omit<Product, "id" | "createdAt">) => void
}

const emptyProduct: Partial<Product> = {
  name: "",
  description: "",
  price: "0",
  category: undefined,
  status: "available",
  stock: 0,
  sku: "",
  image: "",
}

export function ProductAddModal({ open, onOpenChange, onAdd }: ProductAddModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>(emptyProduct)

  function handleSubmit() {
    if (!formData.name || !formData.category) return

    onAdd({
      name: formData.name,
      description: formData.description || "",
      price: formData.price || "0",
      category: formData.category,
      status: formData.status || "available",
      stock: formData.stock || 0,
      sku: formData.sku || "",
      image: formData.image || "",
    })

    setFormData(emptyProduct)
    onOpenChange(false)
  }

  function handleOpenChange(value: boolean) {
    if (!value) setFormData(emptyProduct)
    onOpenChange(value)
  }

  const isValid = formData.name && formData.category

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new dish to your menu.
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={formData} onChange={setFormData} />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Add Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
