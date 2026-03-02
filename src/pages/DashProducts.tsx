import { useState, useMemo } from "react";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsToolbar } from "@/components/products/products-toolbar";
import { ProductAddModal } from "@/components/products/product-add-modal";
import { ProductViewModal } from "@/components/products/product-view-modal";
import { ProductEditModal } from "@/components/products/product-edit-modal";
import { ProductDeleteModal } from "@/components/products/product-delete-modal";
import {
  type Product,
  type ProductCategory,
  type ProductStatus,
} from "@/lib/products-data";
import { supabase } from "../../SupabaseClient";
import { UserAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function DashProducts() {
  const { profile } = UserAuth();
  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">(
    "all",
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.id.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  async function handleAddProduct(
    newProduct: Omit<Product, "id" | "createdAt">,
  ) {
    if (!profile) return;

    console.log(newProduct);

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          user_id: profile?.uid,
          ...newProduct,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    console.log(data);

    setProducts((prev) => [
      { ...newProduct, id: data[0].id, createdAt: data[0]["created_at"] },
      ...prev,
    ]);
  }

  async function handleEditProduct(updatedProduct: Product) {
    const { id, createdAt, price, ...rest } = updatedProduct;

    const { data, error } = await supabase
      .from("products")
      .update(rest)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
  }

  async function handleDeleteProduct(productId: string) {
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) console.error(error);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setDeleteProduct(null);
  }

  function handleView(product: Product) {
    setViewProduct(product);
  }

  function handleEdit(product: Product) {
    setEditProduct(product);
  }

  function handleDelete(product: Product) {
    setDeleteProduct(product);
  }

  useEffect(() => {
    const loadProducts = async () => {
      if (profile) {
        const { data } = await supabase
          .from("products")
          .select()
          .eq("user_id", profile?.uid);
        if (data) {
          const malinis = data.map((item) => {
            return {
              ...item,
              price: parseInt(item.price),
              createdAt: item.created_at,
            };
          });
          setProducts(malinis);
        }
      }
    };
    loadProducts();
  }, [profile]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your menu items, pricing, and availability.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <ProductsToolbar
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAddClick={() => setAddModalOpen(true)}
            totalCount={products.length}
            filteredCount={filteredProducts.length}
          />

          <ProductsTable
            products={filteredProducts}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ProductAddModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdd={handleAddProduct}
      />
      <ProductViewModal
        product={viewProduct}
        open={!!viewProduct}
        onOpenChange={(open) => !open && setViewProduct(null)}
      />
      <ProductEditModal
        product={editProduct}
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        onSave={handleEditProduct}
      />
      <ProductDeleteModal
        product={deleteProduct}
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </main>
  );
}
