import {
  UtensilsCrossed,
  Flame,
  Cake,
  Beer,
  Soup
} from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, React.ElementType> = {
  UtensilsCrossed,
  Flame,
  Cake,
  Beer,
  Soup
}

interface Category {
  id: string
  label: string
  icon: string
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: readonly Category[]
  activeCategory: string
  onCategoryChange: (id: string) => void
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || UtensilsCrossed
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
