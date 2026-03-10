import { Star, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shop } from "@/lib/data";
import { useRef } from "react";
import logo from "@/assets/logo.jpg"

function ShopCard({ shop }: { shop: Shop }) {
  
  if(!shop.shop_name) return null;

  return (
    <div className="group relative min-w-[280px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg md:min-w-[320px]">
      <div className="relative h-44 overflow-hidden">
        <img
          src={shop.image || logo}
          alt={shop.shop_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-foreground/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-xs font-semibold text-card-foreground">
            {"4.9"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-card-foreground">
          {shop.shop_name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{shop.name}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            {shop.shop_description}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeaturedShops({ shops }: { shops: Shop[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Handpicked for you
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
            Featured Restaurants
          </h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-6 flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </section>
  );
}
