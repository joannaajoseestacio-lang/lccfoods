import { Link } from "react-router-dom";
import {
  Search,
  LogOut,
  LogIn,
  LoaderCircle,
  ClipboardList,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../SupabaseClient";
import logo from "@/assets/logo.jpg";

export function Navbar() {
  const { signOut, profile } = UserAuth();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCartCount = async () => {
      if (!profile?.uid) return;
      setLoading(true);
      const { data: cartData } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", profile.uid)
        .limit(1);
      if (cartData && cartData.length > 0) {
        const { data: cartItems } = await supabase
          .from("cart_items")
          .select("id")
          .eq("cart_id", cartData[0].id);
        setCartCount(cartItems?.length ?? 0);
      } else {
        setCartCount(0);
      }
      setLoading(false);
    };
    loadCartCount();
  }, [profile]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9">
              <img className="h-9 w-9 rounded-2xl" src={logo} alt="logo" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-blue-500">
              LCC Canteen
            </span>
          </Link>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for food or restaurants..."
              className="h-10 rounded-full border-border bg-secondary pl-10 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {profile ? (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {loading ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <LoaderCircle className="h-2.5 w-2.5 animate-spin text-primary-foreground" />
                    </span>
                  ) : cartCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  ) : null}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild title="My Orders">
                <Link to="/orders">
                  <ClipboardList className="h-5 w-5" />
                  <span className="sr-only">My Orders</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Sign out"
              >
                <LogOut className="h-5 w-5 text-red-500" />
                <span className="sr-only">Sign out</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span className="text-sm font-medium">Sign in</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
