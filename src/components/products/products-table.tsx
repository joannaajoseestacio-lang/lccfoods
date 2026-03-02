import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import type { Product } from "@/lib/products-data"
import { formatPeso } from "@/lib/products-data"

interface ProductsTableProps {
  products: Product[]
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
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

export function ProductsTable({ products, onView, onEdit, onDelete }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground text-sm">No products found.</p>
        <p className="text-muted-foreground text-xs mt-1">Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.sku}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm capitalize">{product.category}</span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPeso(product.price)}
              </TableCell>
              <TableCell className="text-right">
                <span className={product.stock === 0 ? "text-destructive font-medium" : ""}>
                  {product.stock.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(product.status)}>
                  {getStatusLabel(product.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open menu for {product.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(product)}>
                      <Eye className="size-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(product)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
