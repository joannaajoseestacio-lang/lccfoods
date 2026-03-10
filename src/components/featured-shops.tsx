import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shop } from "@/lib/data";
import logo from "@/assets/logo.jpg";
import { Link } from "react-router-dom";

function ShopCard({ shop }: { shop: Shop }) {
  if (!shop.shop_name) return null;

  return (
    <div className="group relative flex flex-col cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all w-full">
      <div className="relative h-44 overflow-hidden">
        <img
          src={shop.image || logo}
          alt={shop.shop_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="text-xs font-semibold text-card-foreground">4.9</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-card-foreground">
          {shop.shop_name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{shop.name}</p>

        {shop.shop_description && (
          <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
            
            <span className="line-clamp-2">{shop.shop_description}</span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border">
          <Button asChild size="sm" className="w-full gap-2">
            <Link to={`/store/${shop.uid}`}>
              View Store
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedShops({ shops }: { shops: Shop[] }) {
  const validShops = shops.filter((s) => s.shop_name);

  if (!validShops.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Handpicked for you
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
          Featured Restaurants
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {validShops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </section>
  );
}