import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../SupabaseClient";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ProductGrid } from "@/components/product-grid";
import { type Shop, type Product } from "@/lib/data";

export default function StoreProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchStore = async () => {
      const { data } = await supabase
        .from("profiles")
        .select()
        .eq("role", "staff")
        .eq("uid", id)
        .single();

      if (data) setStore(data);
      else navigate("/");
    };

    const fetchProducts = async () => {
      setPending(true);
      const { data } = await supabase
        .from("products")
        .select(`*, profiles (id, image, shop_name)`)
        .eq('user_id', id)

        console.log(data)

      if (data) {
        const cleaned = data.map((item) => ({
          ...item,
          price: parseInt(item.price),
          createdAt: item.created_at,
        }));
        setProducts(cleaned);
      }
      setPending(false);
    };

    fetchStore();
    fetchProducts();
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="relative h-52 bg-muted overflow-hidden">
          {store?.image ? (
            <img
              src={store.image}
              alt="Store cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
        </div>

        {/* Store Info */}
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 py-4 mb-2">

            {/* Store Name & Details */}
            <div className="pb-1">
              {store ? (
                <>
                  <h1 className="text-2xl font-bold leading-tight">
                    {store.shop_name}
                  </h1>
                  {store.shop_description && (
                    <p className="text-sm text-muted-foreground mt-0.5 max-w-xl">
                      {store.shop_description}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2 animate-pulse">
                  <div className="h-6 w-40 rounded bg-muted" />
                  <div className="h-4 w-64 rounded bg-muted" />
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-2" />

          {/* Products Section */}
          <div className="py-2">
            <h2 className="text-lg font-semibold mb-2">Products</h2>
            <ProductGrid
              products={products}
              pending={pending}
              activeCategory="all"
            />
            {!pending && products.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                This store has no products yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}