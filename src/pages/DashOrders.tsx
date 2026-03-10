import { useState, useMemo, useEffect } from "react"
import { supabase } from "../../SupabaseClient"
import { UserAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Pencil, XCircle, MoreHorizontal } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "completed" | "cancelled"

interface Order {
  id: string
  created_at: string
  status: OrderStatus
  customer_id: string
  receipt?: string
  reference?: string
  profiles?: { name: string; email: string, role: string }
  order_items?: { quantity: number; products: { name: string; price: number } }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["all", "pending", "processing", "completed", "cancelled"]
const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "completed", "cancelled"]

const getTotal = (items: Order["order_items"]) =>
  (items ?? []).reduce((s, i) => s + Number(i.products.price) * i.quantity, 0)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const formatPeso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ─── Badge variant helper ─────────────────────────────────────────────────────

function getStatusVariant(status: OrderStatus) {
  switch (status) {
    case "completed":  return "default"      as const
    case "cancelled":  return "destructive"  as const
    case "processing": return "secondary"    as const
    case "pending":    return "outline"      as const
  }
}

function getStatusLabel(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// ─── ViewModal ────────────────────────────────────────────────────────────────

function ViewModal({
  order,
  onClose,
  onEdit,
}: {
  order: Order
  onClose: () => void
  onEdit: (o: Order) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Order Details</p>
            <h2 className="text-lg font-semibold font-mono">{order.id.slice(0, 8).toUpperCase()} {order.profiles?.role === 'teacher' && <span className="text-red-400 text-sm">High Priority</span>}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {([
              ["Customer", order.profiles?.name ?? order.customer_id],
              ["Email",    order.profiles?.email ?? "—"],
              ["Date",     formatDate(order.created_at)],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-medium">{val}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
            </div>
            {order.receipt && (
              <>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Receipt</p>
                  <img src={order.receipt} alt="Receipt" className="w-32 rounded-xl border" />
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reference</p>
                  <p className="text-sm font-medium">{order.reference}</p>
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Items</p>
            <div className="rounded-lg border overflow-hidden">
              {order.order_items?.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${i < (order.order_items?.length ?? 0) - 1 ? "border-b" : ""}`}
                >
                  <span className="font-medium">{item.products?.name ?? "—"}</span>
                  <span className="text-muted-foreground text-xs">x{item.quantity}</span>
                  <span>{formatPeso(Number(item.products?.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40 text-sm font-semibold">
                <span>Total</span>
                <span>{formatPeso(getTotal(order.order_items))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); onEdit(order) }}>Edit Order</Button>
        </div>
      </div>
    </div>
  )
}

// ─── EditModal ────────────────────────────────────────────────────────────────

function EditModal({
  order,
  onClose,
  onSave,
}: {
  order: Order
  onClose: () => void
  onSave: (o: Order) => void
}) {
  const [status,  setStatus]  = useState<OrderStatus>(order.status)
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id)
    setSaving(false)
    if (!error) onSave({ ...order, status })
    else alert("Failed to update order")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Edit Order</p>
            <h2 className="text-lg font-semibold font-mono">{order.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Customer</label>
              <Input value={order.profiles?.name ?? order.customer_id} disabled />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
              <Input value={order.profiles?.email ?? "—"} disabled />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Status</label>
            <Select value={status} onValueChange={(val) => setStatus(val as OrderStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
      {message}
    </div>
  )
}

// ─── OrdersPage ───────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders,     setOrders]     = useState<Order[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState("all")
  const [search,     setSearch]     = useState("")
  const [viewOrder,  setViewOrder]  = useState<Order | null>(null)
  const [editOrder,  setEditOrder]  = useState<Order | null>(null)
  const [toast,      setToast]      = useState("")
  const { profile } = UserAuth()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }

  useEffect(() => {
    if (!profile?.uid) return
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles!orders_customer_id_fkey(name, email, role), order_items(*, products(name, price))")
        .eq("store_id", profile.uid)
        .order("created_at", { ascending: false })
      if (!error && data) setOrders(data)
      setLoading(false)
    }
    load()
  }, [profile])

  const handleSave = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    setEditOrder(null)
    showToast("Order updated successfully")
  }

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id)
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o)))
      showToast("Order cancelled")
    }
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = filter === "all" || o.status === filter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.profiles?.name ?? "").toLowerCase().includes(q) ||
        (o.profiles?.email ?? "").toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [orders, filter, search])

  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and track all customer orders</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          placeholder="Search orders or customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 max-w-72"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f} value={f} className="capitalize">
                {f === "all" ? "All Statuses" : getStatusLabel(f as OrderStatus)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-16 text-muted-foreground text-sm">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground text-sm">No orders found.</p>
          <p className="text-muted-foreground text-xs mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => setViewOrder(order)}
                >
                  {/* Order ID */}
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8).toUpperCase()}
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.profiles?.name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{order.profiles?.email ?? "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    <Badge className={order.profiles.role === 'teacher' ? "bg-pink-400" : "bg-gray-100 text-gray-900"}>{order.profiles.role}</Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>

                  {/* Items */}
                  <TableCell className="text-right">
                    {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right font-medium">
                    {formatPeso(getTotal(order.order_items))}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu for {order.id.slice(0, 8).toUpperCase()}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewOrder(order)}>
                          <Eye className="size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditOrder(order)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        {order.status !== "cancelled" && order.status !== "completed" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Cancel this order?")) handleCancel(order.id)
                              }}
                            >
                              <XCircle className="size-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mt-3 px-1">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}

      {/* Modals */}
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
  )
}