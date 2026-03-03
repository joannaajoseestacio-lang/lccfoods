export type ProductStatus =
  | "available"
  | "out_of_stock"
  | "seasonal"
  | "discontinued";
export type ProductCategory =
  | "soups"
  | "snacks"
  | "desserts"
  | "noodles"
  | "beverages"
  | "rice"
  | "other"
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  status: ProductStatus;
  stock: number;
  sku: string;
  image: string;
  createdAt: string;
}

export const CATEGORIES: ProductCategory[] = [
  "soups",
  "snacks",
  "desserts",
  "noodles",
  "beverages",
  "rice",
  "other"
];

export const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "seasonal", label: "Seasonal" },
  { value: "discontinued", label: "Discontinued" },
];

export function formatPeso(amount: string): string {
  return `₱${parseInt(amount).toFixed(2)}`;
}