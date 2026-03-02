"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/products-data"
import { formatPeso } from "@/lib/products-data"

interface ProductViewModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStatusVariant(status: Product["status"]) {
  switch (status) {
    case "available":
      return "default" as const
    case "out_of_stock":
      return "destructive" as const
    case "seasonal":
      return "secondary" as const
    case "discontinued":
      return "outline" as const
  }
}

function getStatusLabel(status: Product["status"]) {
  switch (status) {
    case "available":
      return "Available"
    case "out_of_stock":
      return "Out of Stock"
    case "seasonal":
      return "Seasonal"
    case "discontinued":
      return "Discontinued"
  }
}

export function ProductViewModal({ product, open, onOpenChange }: ProductViewModalProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-balance">{product.name}</DialogTitle>
            <Badge variant={getStatusVariant(product.status)}>
              {getStatusLabel(product.status)}
            </Badge>
          </div>
          <DialogDescription>
            {product.id} &middot; {product.sku}
          </DialogDescription>
        </DialogHeader>

        {product.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover"
              sizes="(max-width: 520px) 100vw, 520px"
            />
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="mt-1 text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="mt-1 text-lg font-semibold">{formatPeso(product.price)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock</p>
              <p className="mt-1 text-lg font-semibold">{product.stock.toLocaleString()} servings</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="mt-1 text-sm capitalize">{product.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="mt-1 text-sm">
                {new Date(product.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
