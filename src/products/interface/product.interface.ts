// src/products/products.types.ts
export interface FinishedProductRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface ProductListRow {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date | null;
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
  total_finished_product_cost: string;
  recipes: unknown; // aggregated JSON
  items: unknown; // aggregated JSON
}

export interface ProductDetailRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date | null;
  created_by: string | null;
  updated_by: string | null;
  total_direct_items_cost: string;
  total_recipes_cost: string;
  total_finished_product_cost: string;
  recipes: unknown;
  direct_items: unknown;
}
