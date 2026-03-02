import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Upload,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../SupabaseClient";
import { Link, useNavigate } from "react-router-dom";

function QuantityControl({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-9 text-center text-sm font-medium text-gray-800 select-none">
        {quantity}
      </span>
      <button
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        onClick={onIncrement}
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

function CartItem({ item, onQtyChange, onRemove }: { item: any; onQtyChange: any; onRemove: any }) {
  const lineTotal = item.products.price * item.quantity;
  return (
    <div className="flex gap-4 py-5">
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
        <img
          src={item.products.image}
          alt={item.products.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] tracking-widest uppercase font-semibold text-gray-400 mb-0.5">
          {item.products.profiles.shop_name}
        </p>
        <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
          {item.products.name}
        </h3>
        <div className="flex items-center gap-3 mt-3">
          <QuantityControl
            quantity={item.quantity}
            onDecrement={() => onQtyChange(item.id, -1)}
            onIncrement={() => onQtyChange(item.id, 1)}
          />
          <button
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.products.name}`}
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
      </div>
      <div className="text-right shrink-0 pt-0.5">
        <p className="font-semibold text-gray-800 text-sm">
          {lineTotal.toLocaleString()}
        </p>
        {item.quantity > 1 && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            {item.products.price.toLocaleString()} each
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-semibold text-gray-800" : "text-gray-500"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ShopPaymentCard({ shop, items, receipt, uploading, onFileChange }: { shop: any; items: any[]; receipt: string | null; uploading: boolean; onFileChange: any }) {
  const shopSubtotal = items.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Store className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 flex-1 truncate">
          {shop.shop_name}
        </p>
        <span className="text-xs font-semibold text-gray-700">
          {shopSubtotal.toLocaleString()}
        </span>
      </div>
      <div className="px-6 py-5 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">GCash Number</span>
          <span className="font-medium text-gray-800 tabular-nums tracking-wide">
            {shop.shop_gcash ?? "—"}
          </span>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Upload receipt for {shop.shop_name}
          </Label>
          <label className="relative group flex items-center justify-center border border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 overflow-hidden">
            {receipt ? (
              <div className="relative w-28 aspect-[9/16]">
                <img
                  src={receipt}
                  alt="Receipt"
                  className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
                    <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                {uploading ? (
                  <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                      Click to upload screenshot
                    </span>
                  </>
                )}
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<Record<string, string>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { profile, session, loading: profileLoading } = UserAuth();
    const navigate = useNavigate();

  useEffect(() => {
    const loadSession = () => {
      if (!profileLoading && !session) {
        navigate("/login");
        return;
      }
    };
    loadSession();
  }, [session, profile, profileLoading]);

  const shopGroups: Record<string, { shop: any; items: any[]; uid: string }> =
    items.reduce(
      (acc: Record<string, { shop: any; items: any[]; uid: string }>, item: any) => {
        const storeId = item.products.profiles.id;
        if (!acc[storeId]) {
          acc[storeId] = {
            shop: item.products.profiles,
            items: [],
            uid: item.products.profiles.uid,
          };
        }
        acc[storeId].items.push(item);
        return acc;
      },
      {},
    );

  const shopGroupList = Object.entries(shopGroups);

  const allReceiptsUploaded =
    shopGroupList.length > 0 &&
    shopGroupList.every(([storeId]) => !!receipts[storeId]);

  const handleQtyChange = async (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
    const current = items.find((it) => it.id === id);
    if (!current) return;
    await supabase
      .from("cart_items")
      .update({ quantity: Math.max(1, current.quantity + delta) })
      .eq("id", id);
  };

  const handleRemove = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await supabase.from("cart_items").delete().eq("id", id);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0,
  );
  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  useEffect(() => {
    if (!profile?.uid) return;
    const loadCart = async () => {
      setLoading(true);
      const { data: carts } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", profile.uid)
        .limit(1);
      if (carts && carts.length > 0) {
        const { data: cartItems } = await supabase
          .from("cart_items")
          .select("*, products(*, profiles(id, uid, shop_name, shop_gcash))")
          .eq("cart_id", carts[0].id);
        if (cartItems && cartItems.length > 0) {
          setItems(cartItems);
        }
      }
      setLoading(false);
    };
    loadCart();
  }, [profile]);

  const handleFileChange =
    (storeId: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingMap((prev) => ({ ...prev, [storeId]: true }));
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(
          "https://api.lccgatepass.xyz/api/v1/upload/imagekit",
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (data?.url) {
          setReceipts((prev) => ({ ...prev, [storeId]: data.url }));
        } else {
          alert("Upload failed: no URL returned");
        }
      } catch (err) {
        alert("Image upload failed");
      } finally {
        setUploadingMap((prev) => ({ ...prev, [storeId]: false }));
      }
    };

  const handleOrder = async () => {
    try {
      const { data: carts } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", profile.uid)
        .limit(1);
      const cartId = carts?.[0]?.id;
      for (const [storeId, { items: shopItems, uid: storeUid }] of shopGroupList) {
        const { data: insertedOrder, error: orderError } = await supabase
          .from("orders")
          .insert([{
            customer_id: profile.uid,
            status: "pending",
            receipt: receipts[storeId] ?? null,
            store_id: storeUid,
          }])
          .select();
        if (orderError || !insertedOrder?.length) {
          console.error("Order insert error:", orderError);
          throw new Error(`Failed to create order for store: ${storeId}`);
        }
        const orderId = insertedOrder[0].id;
        const orderItems = shopItems.map((item: any) => ({
          product_id: item.products.id,
          quantity: item.quantity,
          order_id: orderId,
        }));
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);
        if (itemsError) {
          console.error("Order items insert error:", itemsError);
          throw new Error(`Failed to insert items for store: ${storeId}`);
        }
      }
      if (cartId) {
        await supabase.from("cart_items").delete().eq("cart_id", cartId);
        await supabase.from("carts").delete().eq("id", cartId);
      }
      setItems([]);
      setReceipts({});
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight mb-1">
            Cart
            {items.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-24 text-gray-400 text-sm">
            Loading your cart...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-28">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500 mb-1">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Looks like you have not added anything yet.
            </p>
            <a href="/">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white text-xs uppercase tracking-widest rounded-lg px-8">
                Start Shopping
              </Button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Items ({items.length})
                </p>
              </div>
              <div className="px-6 divide-y divide-gray-100">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Order Summary
                  </p>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <SummaryRow label="Subtotal" value={`${subtotal.toLocaleString()}`} />
                  <SummaryRow label="VAT (10%)" value={`${vat.toLocaleString()}`} />
                  <Separator />
                  <SummaryRow label="Total" value={`${total.toLocaleString()}`} bold />
                </div>
              </div>

              {shopGroupList.map(([storeId, { shop, items: shopItems }]) => (
                <ShopPaymentCard
                  key={storeId}
                  shop={shop}
                  items={shopItems}
                  receipt={receipts[storeId] ?? null}
                  uploading={uploadingMap[storeId] ?? false}
                  onFileChange={handleFileChange(storeId)}
                />
              ))}

              <Button
                className="w-full h-12 rounded-xl text-xs uppercase tracking-widest font-semibold text-white shadow-sm transition-all active:scale-[0.99]"
                disabled={!allReceiptsUploaded}
                onClick={handleOrder}
              >
                Place Order
              </Button>

              {!allReceiptsUploaded && (
                <p className="text-center text-[11px] text-gray-400">
                  Upload a receipt for each store to continue
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}