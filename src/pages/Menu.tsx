"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { HeroBanner } from "@/components/hero-banner";
import { FeaturedShops } from "@/components/featured-shops";
import { CategoryFilter } from "@/components/category-filter";
import { ProductGrid } from "@/components/product-grid";
import { Footer } from "@/components/footer";
import { categories, type Shop } from "@/lib/data";
import { type Product } from "@/lib/data";
import { supabase } from "../../SupabaseClient";
import { useEffect } from "react";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pending, setPending] = useState(true);
  const { profile, session } = UserAuth();
  const navigate = useNavigate();

 const isPWA = () => {
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }
  // Fallback for iOS
  if ('standalone' in navigator && navigator.standalone) {
    return true;
  }
  return false;
};

  useEffect(() => {
    if (profile) {
      console.log(session)
      if (profile.role === "admin") {
        navigate("/admin");
      } else if (profile.role === "staff") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [profile, session, navigate]);

  useEffect(() => {
    const loadProducts = async () => {
      setPending(true);
      const { data } = await supabase
        .from("products")
        .select(`*, profiles (id, image, shop_name)`);
      if (data) {
        const malinis = data.map((item) => {
          return {
            ...item,
            price: parseInt(item.price),
            createdAt: item.created_at,
          };
        });
        setProducts(malinis);
      }
      setPending(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadShops = async () => {
      setPending(true);
      const { data } = await supabase
        .from("profiles")
        .select()
        .eq("role", "staff")
        .eq("shop_status", "approved");
      if (data) {
        setShops(data);
      }
      setPending(false);
    };
    loadShops();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {!isPWA() && <HeroBanner />}
        <FeaturedShops shops={shops} />
        <div className="border-t border-border">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <ProductGrid
            products={products}
            pending={pending}
            activeCategory={activeCategory}
          />
        </div>
      </main>
      {!isPWA() && <Footer />}
    </div>
  );
}
