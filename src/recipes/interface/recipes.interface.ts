// src/recipes/recipes.types.ts
export interface RecipeRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  yield_qty_g: number;
  total_recipe_cost: number | null;
  recipe_cost_per_gram: number | null;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface RecipeListRow {
  id: string;
  name: string;
  description: string | null;
  yield_qty_g: number;
  created_at: Date;
  updated_at: Date | null;
  total_recipe_cost: string;
  recipe_cost_per_gram: string;
  created_by: string | null;
  updated_by: string | null;
  items: unknown; // JSON column
}

export interface RecipeItemRow {
  recipe_id: string;
  item_id: string;
  qty_g: number;
  waste_pct: number;
  item_name: string;
  cost_per_base_unit: string;
}
