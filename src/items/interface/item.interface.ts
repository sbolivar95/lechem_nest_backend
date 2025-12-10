// src/items/items.types.ts
export interface ItemRow {
  id: string;
  org_id: string;
  name: string;
  sku: string | null;
  purchase_unit_id: string;
  purchase_qty: number;
  purchase_cost: number;
  base_unit_id: string;
  base_qty_per_purchase: number;
  active: boolean;
  cost_per_base_unit: string;
  category_id: string | null;
}

export interface ItemListRow {
  id: string;
  name: string;
  sku: string | null;
  purchase_cost: number;
  active: boolean;
  cost_per_base_unit: string;
  purchase_unit: string;
  base_unit: string;
  category_name: string | null;
}

export interface UnitRow {
  id: string;
  symbol: string;
  name: string;
}
