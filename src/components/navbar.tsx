import { Link, useNavigate } from "react-router-dom";
import { LogOut, LogIn, ShoppingBag, ChevronLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../SupabaseClient";
import logo from "@/assets/logo.jpg";

function useCartCount(uid?: string) {
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const loadCartCount = async () => {
      setLoading(true);
      const { data: cartData } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", uid)
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
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const loadOrderCount = async () => {
      setLoading(true);
      const { data: cartData } = await supabase
        .from("orders")
        .select("id")
        .eq("customer_id", uid)
        .neq('status', 'completed')
        .limit(1);
      if (cartData && cartData.length > 0) {
        const { data: cartItems } = await supabase
          .from("order_items")
          .select("id")
          .eq("order_id", cartData[0].id);
        setOrderCount(cartItems?.length ?? 0);
      } else {
        setOrderCount(0);
      }
      setLoading(false);
    };
    loadOrderCount();
  }, [uid]);

  return { orderCount, cartCount, loading };
}

function getInitials(profile: { name?: string; email?: string } | null) {
  if (profile?.name) {
    return profile.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (profile?.email) return profile.email[0].toUpperCase();
  return "U";
}

function ProfileMenu({ profile, signOut }: { profile: any; signOut: () => void }) {
  const { cartCount, orderCount, loading } = useCartCount(profile?.uid);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 ml-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.image ?? undefined} alt={profile?.name ?? "User avatar"} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
              {getInitials(profile)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {profile?.name && (
              <p className="text-sm font-medium leading-none">{profile.name}</p>
            )}
            {profile?.email && (
              <p className="text-xs leading-none text-muted-foreground truncate">
                {profile.email}{" "}
              </p>
            )}
            <span className="text-primary text-xs font-mono capitalize">{profile?.role}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/cart" className="flex items-center gap-2 cursor-pointer">
            <ShoppingCart className="h-4 w-4" />
            My Cart <span className="text-xs bg-blue-400 rounded-full font-medium text-white py-px px-1.5">{!loading ? cartCount : 0}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="h-4 w-4" />
            My Orders <span className="text-xs bg-blue-400 rounded-full font-medium text-white py-px px-1.5">{!loading ? orderCount : 0}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" color="#fb2c36" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavbarGoBack({ label }: { label: string }) {
  const { signOut, profile } = UserAuth();

  return (
    <header className="sticky md:hidden top-0 z-50 border-b-gray-300 border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <ChevronLeft />
          </Link>
          <h1 className="font-medium">{label}</h1>
        </div>
        <div className="flex items-center gap-1">
          {profile ? (
            <ProfileMenu profile={profile} signOut={signOut} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  const { signOut, profile } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    const routes: Record<string, string> = {
      admin: "/admin",
      staff: "/dashboard",
    };
    navigate(routes[profile.role] ?? "/");
  }, [profile, navigate]);

  return (
    <header className="sticky top-0 z-50 border-b-gray-300 border-border bg-card/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img className="h-9 w-9 rounded-2xl" src={logo} alt="logo" />
          <span className="text-lg font-semibold tracking-tight text-blue-500 font-serif">
            LCC Canteen
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {profile ? (
            <ProfileMenu profile={profile} signOut={signOut} />
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
}

function SignInButton() {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/login" className="flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        <span className="text-sm font-medium">Sign in</span>
      </Link>
    </Button>
  );
}