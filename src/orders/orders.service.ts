// src/orders/orders.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderItemRow,
  OrderRow,
  OrderStatus,
  OrderWithItems,
  SaleProductRow,
} from './interface/order.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(@Inject('PG_POOL') private readonly db: Pool) {}

  private async getClient(): Promise<PoolClient> {
    return this.db.connect();
  }

  async create(orgId: number, dto: CreateOrderDto): Promise<OrderWithItems> {
    const client = await this.getClient();

    try {
      await client.query('begin');

      const orderId = crypto.randomUUID();

      // 1. Load products with proper typing
      const productIds = dto.items.map((i) => i.productId);
      if (productIds.length === 0) {
        throw new ForbiddenException('Order must contain at least one item');
      }

      const productsResult = await client.query<SaleProductRow>(
        `
        select *
        from sale_products
        where org_id = $1
          and id = any($2::uuid[])
          and is_active = true
        `,
        [orgId, productIds],
      );

      const productsById = new Map<string, SaleProductRow>();
      for (const p of productsResult.rows) {
        productsById.set(p.id, p);
      }

      // 2. Build items array with explicit type
      let totalCents = 0;
      const orderItemsRows: OrderItemRow[] = [];

      for (const item of dto.items) {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new NotFoundException(
            `Product ${item.productId} not found or inactive for this org`,
          );
        }

        const unitPrice = product.price_cents;
        const lineTotal = unitPrice * item.quantity;
        totalCents += lineTotal;

        const orderItem: OrderItemRow = {
          id: crypto.randomUUID(),
          order_id: orderId,
          product_id: item.productId,
          product_name_snapshot: product.name,
          unit_price_cents: unitPrice,
          quantity: item.quantity,
          line_total_cents: lineTotal,
        };

        orderItemsRows.push(orderItem);
      }

      // 3. Insert order with typed result
      const orderResult = await client.query<OrderRow>(
        `
        insert into orders (
          id, org_id, customer_id, customer_name, customer_email,
          customer_phone, status, total_cents, approved_by_member_id,
          approved_at, created_at
        )
        values (
          $1, $2, $3, $4, $5,
          $6, 'PENDING', $7, null,
          null, now()
        )
        returning *
        `,
        [
          orderId,
          orgId,
          dto.customerId ?? null,
          dto.customerName,
          dto.customerEmail ?? null,
          dto.customerPhone ?? null,
          totalCents,
        ],
      );

      const order = orderResult.rows[0];
      if (!order) {
        throw new Error('Failed to insert order');
      }

      // 4. Insert items
      for (const row of orderItemsRows) {
        await client.query(
          `
          insert into order_items (
            id, order_id, product_id,
            product_name_snapshot, unit_price_cents,
            quantity, line_total_cents
          )
          values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            row.id,
            row.order_id,
            row.product_id,
            row.product_name_snapshot,
            row.unit_price_cents,
            row.quantity,
            row.line_total_cents,
          ],
        );
      }

      await client.query('commit');

      const orderWithItems: OrderWithItems = {
        ...order,
        items: orderItemsRows,
      };

      return orderWithItems;
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  async findAll(orgId: number, status?: OrderStatus): Promise<OrderRow[]> {
    const params: Array<number | string> = [orgId];
    let where = 'where o.org_id = $1';

    if (status) {
      params.push(status);
      where += ` and o.status = $${params.length}`;
    }

    const result = await this.db.query<OrderRow>(
      `
      select o.*
      from orders o
      ${where}
      order by o.created_at desc
      `,
      params,
    );

    return result.rows;
  }

  async findOne(orgId: number, orderId: string): Promise<OrderWithItems> {
    const orderResult = await this.db.query<OrderRow>(
      `
      select *
      from orders
      where org_id = $1 and id = $2
      `,
      [orgId, orderId],
    );

    if (orderResult.rowCount === 0) {
      throw new NotFoundException('Order not found');
    }

    const order = orderResult.rows[0];

    const itemsResult = await this.db.query<OrderItemRow>(
      `
      select *
      from order_items
      where order_id = $1
      order by product_name_snapshot
      `,
      [orderId],
    );

    const orderWithItems: OrderWithItems = {
      ...order,
      items: itemsResult.rows,
    };

    return orderWithItems;
  }

  async updateStatus(
    orgId: number,
    orderId: string,
    dto: UpdateOrderStatusDto,
    approverMemberId: string,
  ): Promise<OrderRow> {
    const now = new Date();

    const result = await this.db.query<OrderRow>(
      `
      update orders
      set status = $1,
          approved_by_member_id = case
            when $1 = 'APPROVED' then $2
            else approved_by_member_id
          end,
          approved_at = case
            when $1 = 'APPROVED' then $3
            else approved_at
          end,
          updated_at = $3
      where org_id = $4 and id = $5
      returning *
      `,
      [dto.status, approverMemberId, now, orgId, orderId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Order not found');
    }

    return result.rows[0];
  }

  async remove(orgId: number, orderId: string): Promise<OrderRow> {
    const result = await this.db.query<OrderRow>(
      `
      delete from orders
      where org_id = $1 and id = $2
      returning *
      `,
      [orgId, orderId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Order not found');
    }

    return result.rows[0];
  }
}
