export interface SaleProductRow {
  id: string;
  org_id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string | null;
  is_active: boolean;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
}
