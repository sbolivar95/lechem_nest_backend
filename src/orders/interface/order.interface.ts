// src/orders/order.types.ts

export interface SaleProductRow {
  id: string;
  org_id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  is_active: boolean;
  stock_quantity: number | null;
  created_at: Date;
  updated_at: Date | null;
}

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface OrderRow {
  id: string;
  org_id: number;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  total_cents: number;
  approved_by_member_id: string | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

// handy type for detail view
export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}
