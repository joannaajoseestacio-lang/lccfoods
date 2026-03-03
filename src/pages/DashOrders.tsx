import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../SupabaseClient";
import { UserAuth } from "@/context/AuthContext";

const STATUS_FILTERS = [
  "all",
  "pending",
  "processing",
  "completed",
  "cancelled",
];
const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

const getTotal = (items: any[]) =>
  items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${STATUS_STYLES[status] ?? "bg-slate-50 text-slate-500 ring-slate-200"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-slate-400"}`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ViewModal({
  order,
  onClose,
  onEdit,
}: {
  order: any;
  onClose: () => void;
  onEdit: (o: any) => void;
}) {
  if (!order) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              Order Details
            </p>
            <h2 className="text-lg font-semibold text-slate-800">
              {order.id.slice(0, 8).toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Customer", order.profiles?.name ?? order.customer_id],
              ["Email", order.profiles?.email ?? "—"],
              ["Date", formatDate(order.created_at)],
              ["Status", null],
            ].map(([label, val]) => (
              <div key={label as string}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {label}
                </p>
                {val ? (
                  <p className="text-sm text-slate-700 font-medium">
                    {val as string}
                  </p>
                ) : (
                  <StatusBadge status={order.status} />
                )}
              </div>
            ))}
            {order.receipt && (
              <div className="space-y-4">
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Receipt
                  </p>
                  <img
                    src={order.receipt}
                    alt="Receipt"
                    className="w-32 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Reference
                  </p>
                  <p>{order.reference}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
              Items
            </p>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              {order.order_items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${i < order.order_items.length - 1 ? "border-b border-slate-50" : ""}`}
                >
                  <span className="text-slate-700 font-medium">
                    {item.products?.name ?? "—"}
                  </span>
                  <span className="text-slate-400 text-xs">
                    x {item.quantity}
                  </span>
                  <span className="text-slate-700">
                    &#8369;
                    {(
                      Number(item.products?.price) * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 text-sm font-semibold">
                <span className="text-slate-600">Total</span>
                <span className="text-slate-800">
                  &#8369;{getTotal(order.order_items ?? []).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(order);
            }}
            className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Edit Order
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  order,
  onClose,
  onSave,
}: {
  order: any;
  onClose: () => void;
  onSave: (o: any) => void;
}) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-400 transition-all";
  const labelCls =
    "block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5";

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);
    setSaving(false);
    if (!error) {
      onSave({ ...order, status });
    } else {
      alert("Failed to update order");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              Edit Order
            </p>
            <h2 className="text-lg font-semibold text-slate-800">{order.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Customer</label>
              <input
                className={inputCls}
                value={order.profiles?.name ?? order.customer_id}
                disabled
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={inputCls}
                value={order.profiles?.email ?? "—"}
                disabled
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
      {message}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [toast, setToast] = useState("");
  const { profile } = UserAuth();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  useEffect(() => {
    if (!profile?.uid) return;
    const loadOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          "*, profiles!orders_customer_id_fkey(name, email), order_items(*, products(name, price))",
        )
        .eq("store_id", profile.uid)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    };
    loadOrders();
  }, [profile]);

  const handleSave = (updated: any) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditOrder(null);
    showToast("Order updated successfully");
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)),
      );
      showToast("Order cancelled");
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = filter === "all" || o.status === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.profiles?.name ?? "").toLowerCase().includes(q) ||
        (o.profiles?.email ?? "").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [orders, filter, search]);

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Orders
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage and track all customer orders
        </p>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-50">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-48 max-w-72">
            <svg
              className="w-3.5 h-3.5 text-slate-400 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="bg-transparent outline-none text-sm text-slate-600 placeholder:text-slate-400 w-full"
              placeholder="Search orders or customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                {[
                  "Order",
                  "Customer",
                  "Date",
                  "Items",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-slate-400 text-sm"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-slate-400 text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-8 h-8 text-slate-200"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                      </svg>
                      No orders found
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setViewOrder(order)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-600">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700 leading-none">
                        {order.profiles?.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.profiles?.email ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {order.order_items?.length ?? 0} item
                      {(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      &#8369;
                      {getTotal(order.order_items ?? []).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          title="View"
                          onClick={() => setViewOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          title="Edit"
                          onClick={() => setEditOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {order.status !== "cancelled" &&
                          order.status !== "completed" && (
                            <button
                              title="Cancel order"
                              onClick={() => {
                                if (confirm(`Cancel this order?`))
                                  handleCancel(order.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="m15 9-6 6M9 9l6 6" />
                              </svg>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
        )}
      </div>

      {viewOrder && (
        <ViewModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onEdit={(o) => setEditOrder(o)}
        />
      )}
      {editOrder && (
        <EditModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
          onSave={handleSave}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
