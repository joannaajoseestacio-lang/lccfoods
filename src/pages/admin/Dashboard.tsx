import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
} from "lucide-react";
import { type Shop } from "@/lib/data";
import { supabase } from "../../../SupabaseClient";
import { toast } from "sonner";
import { UserAuth } from "@/context/AuthContext";

const variantStatusMap: Record<string, "secondary" | "destructive" | "default" | "outline"> = {
  pending: "secondary",
  reviewing: "outline",
  approved: "default",
  rejected: "destructive",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

// ── View Dialog ───────────────────────────────────────────────────────────────
function ViewDetailsDialog({
  shop,
  open,
  onClose,
}: {
  shop: Shop | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!shop) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Store Details</DialogTitle>
          <DialogDescription>Full information for this store.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 py-2">
          <div className="relative size-16 overflow-hidden rounded-lg bg-muted shrink-0">
            {shop.image ? (
              <img src={shop.image} alt={shop.shop_name ?? ""} className="object-cover size-full" />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No img</div>
            )}
          </div>
          <div>
            <p className="font-semibold text-base">{shop.shop_name}</p>
            <p className="text-sm text-muted-foreground">{shop.shop_description}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Owner", value: shop.name },
            { label: "GCash No.", value: shop.shop_gcash },
            {
              label: "Created At",
              value: new Date(shop.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              }),
            },
            {
              label: "Status",
              value: (
                <Badge variant={variantStatusMap[shop.shop_status ?? "pending"]} className="capitalize">
                  {shop.shop_status}
                </Badge>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────
function EditDialog({
  shop, open, onClose, onSave,
}: {
  shop: Shop | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Shop>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Shop>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shop) setForm({
      shop_name: shop.shop_name,
      shop_description: shop.shop_description,
      shop_gcash: shop.shop_gcash,
      shop_status: shop.shop_status,
    });
  }, [shop]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!shop) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Store</DialogTitle>
          <DialogDescription>Update the details for <strong>{shop.shop_name}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="shop_name">Shop Name</Label>
            <Input id="shop_name" value={form.shop_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, shop_name: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="shop_description">Description</Label>
            <Input id="shop_description" value={form.shop_description ?? ""} onChange={(e) => setForm((f) => ({ ...f, shop_description: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="shop_gcash">GCash No.</Label>
            <Input id="shop_gcash" value={form.shop_gcash ?? ""} onChange={(e) => setForm((f) => ({ ...f, shop_gcash: e.target.value }))} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="shop_status">Status</Label>
            <Select value={form.shop_status ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, shop_status: v as Shop["shop_status"] }))}>
              <SelectTrigger id="shop_status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Alert ──────────────────────────────────────────────────────────────
function DeleteAlert({
  shop, open, onClose, onConfirm,
}: {
  shop: Shop | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Store</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{shop?.shop_name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Recent Applied Stores Panel ───────────────────────────────────────────────
function RecentAppliedStores() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | string>("all");

  const [viewShop, setViewShop] = useState<Shop | null>(null);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null);

  const filters = ["all", "pending", "reviewing", "approved", "rejected"];
  const pendingCount = shops.filter((s) => s.shop_status === "pending").length;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select().eq("role", "staff");
      if (data) setShops(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const byStatus = filter === "all" ? shops : shops.filter((s) => s.shop_status === filter);
    if (!q) return byStatus;
    return byStatus.filter(
      (s) =>
        s.shop_name?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.shop_status?.toLowerCase().includes(q),
    );
  }, [shops, filter, search]);

  const handleEdit = async (updated: Partial<Shop>) => {
    if (!editShop) return;
    const { error } = await supabase.from("profiles").update(updated).eq("id", editShop.id);
    if (error) { toast.error("Failed to update store."); return; }
    setShops((prev) => prev.map((s) => (s.id === editShop.id ? { ...s, ...updated } : s)));
    toast.success("Store updated successfully.");
    setEditShop(null);
  };

  const handleDelete = async () => {
    if (!deleteShop) return;
    const { error } = await supabase.from("profiles").delete().eq("id", deleteShop.id);
    if (error) { toast.error("Failed to delete store."); return; }
    setShops((prev) => prev.filter((s) => s.id !== deleteShop.id));
    toast.success("Store deleted successfully.");
    setDeleteShop(null);
  };

  const handleStatusUpdate = async (shop: Shop, status: string) => {
    const { error } = await supabase.from("profiles").update({ shop_status: status }).eq("id", shop.id);
    if (error) { toast.error("Failed to update status."); return; }
    setShops((prev) => prev.map((s) => s.id === shop.id ? { ...s, shop_status: status as Shop["shop_status"] } : s));
    toast.success(`Store ${status} successfully.`);
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Recent Applied Stores</h3>
            {pendingCount > 0 && <Badge variant="secondary">{pendingCount}</Badge>}
          </div>
          <Button variant="ghost" size="sm">View all</Button>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
          <div className="flex gap-1 overflow-x-auto">
            {filters.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                className="capitalize flex-shrink-0"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <div className="relative w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        <div className="rounded-lg border mx-4 mb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {search ? `No stores matching "${search}".` : "No stores found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{shop.shop_name}</span>
                        <span className="text-xs text-muted-foreground">{shop.shop_description ?? "Store not configured yet."}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{shop.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(shop.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variantStatusMap[shop.shop_status ?? "pending"]} className="capitalize">
                        {shop.shop_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewShop(shop)}>
                            <Eye className="size-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditShop(shop)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          {(shop.shop_status === "pending" || shop.shop_status === "reviewing") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusUpdate(shop, "approved")}>
                                <CheckCircle className="size-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => handleStatusUpdate(shop, "rejected")}>
                                <XCircle className="size-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteShop(shop)}>
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ViewDetailsDialog shop={viewShop} open={!!viewShop} onClose={() => setViewShop(null)} />
      <EditDialog shop={editShop} open={!!editShop} onClose={() => setEditShop(null)} onSave={handleEdit} />
      <DeleteAlert shop={deleteShop} open={!!deleteShop} onClose={() => setDeleteShop(null)} onConfirm={handleDelete} />
    </>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, loading }: { label: string; value: number | null; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      {loading || value === null ? (
        <div className="mt-2 h-8 w-20 rounded-lg bg-muted animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-card-foreground tabular-nums">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}

function QuickStatPill({ label, value, loading }: { label: string; value: number | null; loading: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/40 transition-colors">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading || value === null ? (
          <div className="mt-1 h-6 w-12 rounded bg-muted animate-pulse" />
        ) : (
          <p className="text-lg font-semibold text-foreground">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { profile } = UserAuth();
  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [counts, setCounts] = useState<{
    students: number | null;
    teachers: number | null;
    stores: number | null;
    signedStudents: number | null;
    signedTeachers: number | null;
    pendingStores: number | null;
    approvedStores: number | null;
  }>({
    students: null,
    teachers: null,
    stores: null,
    signedStudents: null,
    signedTeachers: null,
    pendingStores: null,
    approvedStores: null,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setCountsLoading(true);
      const [
        { count: students },
        { count: teachers },
        { count: stores },
        { count: signedStudents },
        { count: signedTeachers },
        { count: pendingStores },
        { count: approvedStores },
      ] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("teachers").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "staff"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "staff").eq("shop_status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "staff").eq("shop_status", "approved"),
      ]);
      setCounts({
        students: students ?? 0,
        teachers: teachers ?? 0,
        stores: stores ?? 0,
        signedStudents: signedStudents ?? 0,
        signedTeachers: signedTeachers ?? 0,
        pendingStores: pendingStores ?? 0,
        approvedStores: approvedStores ?? 0,
      });
      setCountsLoading(false);
    };
    fetchCounts();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4 px-1">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Good {getGreeting()}, {firstName}! 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{today} · Here's what's happening with your system.</p>
        </div>
        <span className="hidden sm:inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
          Last updated just now
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={counts.students} loading={countsLoading} />
        <StatCard label="Teachers" value={counts.teachers} loading={countsLoading} />
        <StatCard label="Stores" value={counts.stores} loading={countsLoading} />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <QuickStatPill label="Signed Students" value={counts.signedStudents} loading={countsLoading} />
        <QuickStatPill label="Signed Teachers" value={counts.signedTeachers} loading={countsLoading} />
        <QuickStatPill label="Pending Store Reviews" value={counts.pendingStores} loading={countsLoading} />
        <QuickStatPill label="Operational Stores" value={counts.approvedStores} loading={countsLoading} />
      </div>

      <RecentAppliedStores />
    </div>
  );
}