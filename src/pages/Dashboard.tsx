import { UserAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../../SupabaseClient";

interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total: number;
}

export default function Home() {
  const { profile } = UserAuth();
  const [products, setProducts] = useState<number>(0);
  const [orders, setOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      if (!profile?.uid) return;
      setLoading(true);

      const [{ count }, { count: orderCount }, { count: pendingCount }, { data: recent }] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", profile.uid),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", profile.uid),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", profile.uid).eq("status", "pending"),
          supabase.from("orders").select("id, created_at, status, total").eq("store_id", profile.uid).order("created_at", { ascending: false }).limit(5),
        ]);

      setProducts(count ?? 0);
      setOrders(orderCount ?? 0);
      setPendingOrders(pendingCount ?? 0);
      setRecentOrders(recent ?? []);
      setLoading(false);
    };

    loadOverview();
  }, [profile]);

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    preparing: "bg-blue-100 text-blue-700",
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Good {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your store today.
          </p>
        </div>
        {pendingOrders > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-sm font-medium text-amber-700">
              {pendingOrders} pending {pendingOrders === 1 ? "order" : "orders"}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Products"
          value={products}
          icon="🍽️"
          loading={loading}
        />
        <StatCard
          label="Total Orders"
          value={orders}
          icon="📦"
          loading={loading}
        />
        <StatCard
          label="Revenue"
          value="₱12,450"
          icon="💰"
          loading={loading}
          isRaw
        />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Recent Orders</h3>
          <a href="/orders" className="text-sm text-primary hover:underline">
            View all →
          </a>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">🛒</p>
            <p className="text-muted-foreground text-sm">No orders yet. Share your store!</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-card-foreground">
                    ₱{order.total?.toLocaleString()}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                      statusColor[order.status] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
  isRaw,
}: {
  label: string;
  value: number | string;
  icon: string;
  loading: boolean;
  isRaw?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-16 rounded bg-muted animate-pulse" />
        ) : (
          <p className="mt-0.5 text-2xl font-semibold text-card-foreground">
            {isRaw ? value : Number(value).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}