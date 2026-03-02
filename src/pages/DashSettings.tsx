import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2 } from "lucide-react";
import { UserAuth } from "@/context/AuthContext";
import { supabase } from "../../SupabaseClient";

function ImageUpload({ label, hint, value, onChange }) {
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
        className="relative w-full aspect-video cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/40 hover:bg-muted/60 transition"
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

export default function ProfileShopTab() {
  const { profile: user } = UserAuth();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [shop, setShop] = useState({ shopName: "", gcash: "", description: "", cover: null });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [originalShop, setOriginalShop] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);

  useEffect(() => {
    if (!user) return;

    const profileData = { name: user.name || "", email: user.email || "" };
    const shopData = {
      shopName: user.shop_name || "",
      gcash: user.shop_gcash || "",
      description: user.shop_description || "",
      cover: user.image ? { file: null, previewUrl: user.image, uploadedUrl: user.image } : null,
    };

    setProfile(profileData);
    setShop(shopData);
    setOriginalProfile(profileData);
    setOriginalShop(shopData);
  }, [user]);

  const profileChanged = useMemo(
    () => JSON.stringify(profile) !== JSON.stringify(originalProfile),
    [profile, originalProfile]
  );

  const shopChanged = useMemo(
    () => JSON.stringify(shop) !== JSON.stringify(originalShop),
    [shop, originalShop]
  );

  const handleSaveProfile = async () => {
    try {
      setLoadingProfile(true);
      console.log("Saving profile:", profile);
      await supabase.from("profiles").update(profile).eq("uid", user.uid);
      setOriginalProfile(profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveShop = async () => {
    try {
      if(user) {

        setLoadingShop(true);
        
        const payload = {
          shop_name: shop.shopName,
          shop_gcash: shop.gcash,
          shop_description: shop.description,
          image: shop.cover?.uploadedUrl ?? null,
        };
        
        console.log("Saving shop:", payload);
        
        await supabase.from("profiles").update(payload).eq("uid", user.uid);
        setOriginalShop(shop);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingShop(false);
    }
  };

  const resetProfile = () => { if (originalProfile) setProfile(originalProfile); };
  const resetShop = () => { if (originalShop) setShop(originalShop); };

  if (!user) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Tabs defaultValue="profile">
        <TabsList className="mb-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal display details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetProfile}>Reset</Button>
                <Button onClick={handleSaveProfile} disabled={!profileChanged || loadingProfile}>
                  {loadingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Set up your public shop page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ImageUpload
                label="Cover Photo"
                hint="Recommended: 16:9 ratio (e.g. 1200×675)"
                value={shop.cover}
                onChange={(v) => setShop({ ...shop, cover: v })}
              />
              <div>
                <Label>Shop Name</Label>
                <Input value={shop.shopName} onChange={(e) => setShop({ ...shop, shopName: e.target.value })} />
              </div>
              <div>
                <Label>GCash <Badge className="ml-2 text-xs">GCash</Badge></Label>
                <Input value={shop.gcash} onChange={(e) => setShop({ ...shop, gcash: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={4} value={shop.description} onChange={(e) => setShop({ ...shop, description: e.target.value })} />
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetShop}>Reset</Button>
                <Button onClick={handleSaveShop} disabled={!shopChanged || loadingShop}>
                  {loadingShop ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Shop"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}