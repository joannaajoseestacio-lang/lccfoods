export type ProductStatus =
  | "available"
  | "out_of_stock"
  | "seasonal"
  | "discontinued";
export type ProductCategory =
  | "Soups"
  | "Snacks"
  | "Desserts"
  | "Noodles"
  | "CookingPot"
  | "Vegan"
  
export interface Shop {
  id: string
  uid: string
  name: string
  shop_name: string
  email: string
  image: string
  role: number
  created_at: string
  shop_description: string
  shop_gcash: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: string
  category: ProductCategory
  status: ProductStatus
  stock: number
  sku: string
  image: string
  createdAt: string
  profiles: Shop;
}

export const categories = [
  { id: "all", label: "All", icon: "UtensilsCrossed" },
  { id: "snacks", label: "Snacks", icon: "Flame" },
  { id: "desserts", label: "Desserts", icon: "Cake" },
  { id: "noodles", label: "Noddles", icon: "Soup" },
  { id: "beverages", label: "Beverages", icon: "Beer" },
  { id: "rice", label: "Rice", icon: "CookingPot" },
  { id: "other", label: "Other", icon: "Vegan" },
] as const