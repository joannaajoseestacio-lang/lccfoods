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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Pencil, Eye, Trash2, Download, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { type Shop } from "@/lib/data";
import { supabase } from "../../../SupabaseClient";
import { toast } from "sonner";

const variantStatusMap: Record<string, "secondary" | "destructive" | "default"> = {
  pending: "secondary",
  rejected: "destructive",
  approved: "default",
};

// ── CSV Export ──────────────────────────────────────────────────────────────
function exportToCSV(shops: Shop[]) {
  const headers = ["ID", "Shop Name", "Description", "Owner", "GCash No.", "Status", "Created At"];
  const rows = shops.map((s) => [
    s.id,
    s.shop_name ?? "",
    s.shop_description ?? "",
    s.name ?? "",
    s.shop_gcash ?? "",
    s.shop_status ?? "",
    new Date(s.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stores_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── View Details Dialog ──────────────────────────────────────────────────────
function ViewDetailsDialog({ shop, open, onClose }: { shop: Shop | null; open: boolean; onClose: () => void }) {
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

// ── Edit Dialog ──────────────────────────────────────────────────────────────
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
    if (shop) setForm({ shop_name: shop.shop_name, shop_description: shop.shop_description, shop_gcash: shop.shop_gcash, shop_status: shop.shop_status });
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

// ── Delete Alert ─────────────────────────────────────────────────────────────
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
          <AlertDialogAction onClick={handleConfirm} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StoresPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [pending, setPending] = useState(true);
  const [search, setSearch] = useState("");

  const [viewShop, setViewShop] = useState<Shop | null>(null);
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [deleteShop, setDeleteShop] = useState<Shop | null>(null);

  useEffect(() => {
    const loadShops = async () => {
      setPending(true);
      const { data } = await supabase.from("profiles").select().eq("role", "staff");
      if (data) setShops(data);
      setPending(false);
    };
    loadShops();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.shop_name?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.shop_description?.toLowerCase().includes(q) ||
        s.shop_gcash?.toLowerCase().includes(q) ||
        s.shop_status?.toLowerCase().includes(q)
    );
  }, [shops, search]);

  const handleEdit = async (updated: Partial<Shop>) => {
    if (!editShop) return;
    const { error } = await supabase
      .from("profiles")
      .update(updated)
      .eq("id", editShop.id);

    if (error) {
      toast.error("Failed to update store.");
      return;
    }

    setShops((prev) =>
      prev.map((s) => (s.id === editShop.id ? { ...s, ...updated } : s))
    );
    toast.success("Store updated successfully.");
    setEditShop(null);
  };

  const handleDelete = async () => {
    if (!deleteShop) return;
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", deleteShop.id);

    if (error) {
      toast.error("Failed to delete store.");
      return;
    }

    setShops((prev) => prev.filter((s) => s.id !== deleteShop.id));
    toast.success("Store deleted successfully.");
    setDeleteShop(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Manage Stores</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and track all lcc canteen stores.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(filtered)}
          disabled={filtered.length === 0}
        >
          <Download className="size-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[80px]">Banner</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Created At</TableHead>
              <TableHead className="text-right">Gcash No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {search ? `No stores matching "${search}".` : "No stores found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name ?? "No image"}
                          className="object-cover size-full"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{store.shop_name}</span>
                      <span className="text-xs text-muted-foreground">{store.shop_description ?? "Store not configured yet."}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{store.name}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(store.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">{store.shop_gcash}</TableCell>
                  <TableCell>
                    <Badge className="capitalize" variant={variantStatusMap[store.shop_status ?? "pending"]}>
                      {store.shop_status}
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
                        <DropdownMenuItem onClick={() => setViewShop(store)}>
                          <Eye className="size-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditShop(store)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteShop(store)}>
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

      {/* Dialogs */}
      <ViewDetailsDialog shop={viewShop} open={!!viewShop} onClose={() => setViewShop(null)} />
      <EditDialog shop={editShop} open={!!editShop} onClose={() => setEditShop(null)} onSave={handleEdit} />
      <DeleteAlert shop={deleteShop} open={!!deleteShop} onClose={() => setDeleteShop(null)} onConfirm={handleDelete} />
    </div>
  );
}