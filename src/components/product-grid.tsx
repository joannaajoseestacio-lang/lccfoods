import { Star, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/data";
import { supabase } from "../../SupabaseClient";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

function getStatusVariant(status: Product["status"]) {
  switch (status) {
    case "available":
      return "default" as const;
    case "out_of_stock":
      return "destructive" as const;
    case "seasonal":
      return "secondary" as const;
    case "discontinued":
      return "outline" as const;
  }
}

function getStatusLabel(status: Product["status"]) {
  switch (status) {
    case "available":
      return "Available";
    case "out_of_stock":
      return "Out of Stock";
    case "seasonal":
      return "Seasonal";
    case "discontinued":
      return "Discontinued";
  }
}

function ProductCard({ product }: { product: Product }) {
  const { profile } = UserAuth();
  const navigate = useNavigate();

  const handleAddCart = async (productId: string) => {
    if (!profile) {
      navigate("/login");
      return;
    }

    try {
      let { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select()
        .eq("user_id", profile.uid)
        .single();

      if (cartError && cartError.code !== "PGRST116") {
        throw cartError;
      }

      if (!cartData) {
        const { data: newCart, error: insertCartError } = await supabase
          .from("carts")
          .insert([{ user_id: profile.uid }])
          .select()
          .single();

        if (insertCartError) throw insertCartError;
        cartData = newCart;
      }

      const { data: existingItem } = await supabase
        .from("cart_items")
        .select()
        .eq("cart_id", cartData.id)
        .eq("product_id", productId)
        .single();

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertItemError } = await supabase
          .from("cart_items")
          .insert([{ cart_id: cartData.id, product_id: productId, quantity: 1 }]);

        if (insertItemError) throw insertItemError;
      }

      navigate("/cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />

        <Badge
          variant={getStatusVariant(product.status)}
          className="capitalize absolute left-3 top-3 rounded-full"
        >
          {getStatusLabel(product.status)}
        </Badge>

        {/* Floating icon button on hover — hidden if no profile */}
        {profile && (
          <Button
            onClick={() => handleAddCart(product.id)}
            size="icon"
            className="absolute bottom-3 right-3 h-9 w-9 rounded-full shadow-md opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold leading-snug text-card-foreground">
              {product.name}
            </h3>
            <div className="mt-0.5 flex flex-row gap-2">
              <p className="text-xs text-muted-foreground">
                {product.profiles.shop_name}
              </p>
              <p className="capitalize text-xs text-primary">
                {product.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs font-semibold text-secondary-foreground">
              {"4.9"}
            </span>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-foreground">
            ₱{parseInt(product.price).toFixed(2)}
          </span>

          {/* Footer Add to Cart button */}
          <Button
            onClick={() => handleAddCart(product.id)}
            size="sm"
            className="flex items-center gap-1 rounded-full text-xs"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-3 w-3" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  pending,
  activeCategory,
}: {
  products: Product[];
  activeCategory: string;
  pending: boolean;
}) {
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            {activeCategory === "all"
              ? "All Dishes"
              : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}{" "}
            available
          </p>
        </div>
      </div>
      {pending ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-semibold text-foreground">Loading...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We're currently fetching our great products, wait lang pow.
          </p>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-lg font-semibold text-foreground">
                No dishes found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try selecting a different category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
