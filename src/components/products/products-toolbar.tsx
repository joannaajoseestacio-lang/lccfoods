"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, X } from "lucide-react"
import { CATEGORIES, STATUSES, type ProductCategory, type ProductStatus } from "@/lib/products-data"

interface ProductsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: ProductCategory | "all"
  onCategoryFilterChange: (value: ProductCategory | "all") => void
  statusFilter: ProductStatus | "all"
  onStatusFilterChange: (value: ProductStatus | "all") => void
  onAddClick: () => void
  totalCount: number
  filteredCount: number
}

export function ProductsToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
  totalCount,
  filteredCount,
}: ProductsToolbarProps) {
  const hasFilters = search || categoryFilter !== "all" || statusFilter !== "all"

  function handleClearFilters() {
    onSearchChange("")
    onCategoryFilterChange("all")
    onStatusFilterChange("all")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => onCategoryFilterChange(v as ProductCategory | "all")}>
            <SelectTrigger className="w-[170px] capitalize">
              <SelectValue placeholder="Category" className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ProductStatus | "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="size-4" />
              Clear
            </Button>
          )}
          <Button onClick={onAddClick} className="ml-auto">
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filteredCount} of {totalCount} products
      </p>
    </div>
  )
}
