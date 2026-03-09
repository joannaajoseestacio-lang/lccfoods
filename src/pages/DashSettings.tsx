import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2 } from "lucide-react";
import { UserAuth } from "@/context/AuthContext";
import { supabase } from "../../SupabaseClient";

function ImageUpload({ label, hint, value, onChange, className = "" }) {
  const ref = useRef<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("https://api.lccgatepass.xyz/api/v1/upload/imagekit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.url) {
        onChange({ file, previewUrl: data.url, uploadedUrl: data.url });
      } else {
        alert("Upload failed: no URL returned");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => !uploading && ref.current?.click()}
        className={`relative w-36 h-24 cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/40 hover:bg-muted/60 transition ${className}`}
      >
        {value?.previewUrl ? (
          <>
            <img src={value.previewUrl} alt={label} className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 rounded-full bg-background/80 p-1 shadow"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : uploading ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            Uploading...
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm">
            <Upload className="mb-2 h-6 w-6" />
            Click to upload (16:9 recommended)
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ProfileShopSettings() {
  const { profile: user } = UserAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    shopName: "",
    gcash: "",
    description: "",
    cover: null,
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const data = {
      name: user.name || "",
      email: user.email || "",
      shopName: user.shop_name || "",
      gcash: user.shop_gcash || "",
      description: user.shop_description || "",
      cover: user.image ? { file: null, previewUrl: user.image, uploadedUrl: user.image } : null,
    };
    setForm(data);
    setOriginal(data);
  }, [user]);

  const hasChanged = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(original),
    [form, original]
  );

  const set = (key: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          name: form.name,
          shop_name: form.shopName,
          shop_gcash: form.gcash,
          shop_description: form.description,
          image: form.cover?.uploadedUrl ?? null,
        })
        .eq("uid", user.uid);
      setOriginal(form);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { if (original) setForm(original); };

  if (!user) return <div className="p-6 text-sm text-muted-foreground">Loading settings...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and shop details.</p>
      </div>

      {/* Profile Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Profile</h2>
          <p className="text-xs text-muted-foreground">Your personal display information.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={set("name")} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.email} disabled />
          </div>
        </div>
      </div>

      <Separator />

      {/* Shop Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Shop</h2>
          <p className="text-xs text-muted-foreground">Your public-facing shop details.</p>
        </div>
        <ImageUpload
          label="Cover Photo"
          hint="Recommended: 16:9 ratio (e.g. 1200×675)"
          value={form.cover}
          onChange={(v) => setForm((prev) => ({ ...prev, cover: v }))}
          className="max-w-xs"
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Shop Name</Label>
            <Input value={form.shopName} onChange={set("shopName")} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              GCash Number <Badge className="text-xs">GCash</Badge>
            </Label>
            <Input value={form.gcash} onChange={set("gcash")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={set("description")} />
        </div>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset} disabled={!hasChanged}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={!hasChanged || loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}