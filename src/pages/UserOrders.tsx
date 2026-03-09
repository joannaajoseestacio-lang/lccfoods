import { useState, useEffect } from "react";
import { supabase } from "../../SupabaseClient";
import { UserAuth } from "@/context/AuthContext";
import { Package, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-500 ring-red-200",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  processing: "bg-blue-400",
  completed: "bg-emerald-400",
  cancelled: "bg-red-400",
};

const STATUS_STEPS = ["pending", "processing", "completed"];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getTotal = (items: any[]) =>
  items.reduce((s, i) => s + Number(i.products?.price ?? 0) * i.quantity, 0);

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${STATUS_STYLES[status] ?? "bg-slate-50 text-slate-500 ring-slate-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-slate-400"}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatusTracker({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-500">Order Cancelled</p>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center w-full py-3">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${done ? "bg-primary" : "bg-slate-100"}`}>
                {done && i < currentStep ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <span className={`w-2 h-2 rounded-full ${done ? "bg-white" : "bg-slate-300"}`} />
                )}
              </div>
              <span className={`text-[10px] font-medium capitalize whitespace-nowrap ${active ? "text-primary" : done ? "text-slate-500" : "text-slate-300"}`}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all ${i < currentStep ? "bg-primary" : "bg-slate-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const total = getTotal(order.order_items ?? []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-mono font-semibold text-slate-600 leading-none">
              {order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="font-semibold text-slate-700 text-sm">&#8369;{total.toLocaleString()}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 space-y-4 pt-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Order Progress</p>
            <StatusTracker status={order.status} />
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Store</p>
            <p className="text-sm font-medium text-slate-700">{order.profiles?.shop_name ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Items</p>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              {order.order_items?.map((item: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < order.order_items.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {item.products?.image && (
                      <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.products?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    &#8369;{(Number(item.products?.price ?? 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <span className="text-sm font-semibold text-slate-800">&#8369;{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.receipt && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Payment Receipt</p>
              <img src={order.receipt} alt="Receipt" className="w-32 rounded-xl border border-slate-200 shadow-sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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

  const FILTERS = ["all", "pending", "processing", "completed", "cancelled"];

  useEffect(() => {
    if (!profile?.uid) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles!orders_store_id_fkey(shop_name), order_items(*, products(name, price, image))")
        .eq("customer_id", profile.uid)
        .order("created_at", { ascending: false });
      if (!error && data) setOrders(data);
      setLoading(false);
    };
    load();
  }, [profile]);

  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight mb-1">My Orders</h1>
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Continue shopping
          </Link>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-5">
          {FILTERS.map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize`}
              variant={filter === f ? "default" : "outline"}
            >
              {f}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 text-gray-400 text-sm">Loading your orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-500 mb-1">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">Your orders will appear here once you place them.</p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}