// src/items/items.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PG_POOL } from 'src/db/db.module';
import { ItemListRow, ItemRow, UnitRow } from './interface/item.interface';

@Injectable()
export class ItemsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async createItem(
    orgId: string,
    dto: CreateItemDto,
    userId: string,
  ): Promise<ItemRow> {
    const {
      name,
      sku,
      purchase_unit_id,
      purchase_qty,
      purchase_cost,
      base_unit_id,
      base_qty_per_purchase,
      active = true,
      category_id,
    } = dto;

    if (
      !name ||
      !purchase_unit_id ||
      purchase_qty == null ||
      purchase_cost == null ||
      !base_unit_id ||
      base_qty_per_purchase == null
    ) {
      throw new BadRequestException('Missing required fields');
    }

    const result: QueryResult<ItemRow> = await this.pool.query(
      `
      INSERT INTO items (
        org_id,
        name,
        sku,
        purchase_unit_id,
        purchase_qty,
        purchase_cost,
        base_unit_id,
        base_qty_per_purchase,
        active,
        category_id,
        cost_per_base_unit,
        created_by
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $6::numeric / NULLIF($8::numeric, 0), $11
      )
      RETURNING *;
      `,
      [
        orgId,
        name,
        sku ?? null,
        purchase_unit_id,
        purchase_qty,
        purchase_cost,
        base_unit_id,
        base_qty_per_purchase,
        active,
        category_id ?? null,
        userId,
      ],
    );

    return result.rows[0];
  }

  async listItems(orgId: string): Promise<ItemListRow[]> {
    const result: QueryResult<ItemListRow> = await this.pool.query(
      `
      SELECT
        i.id,
        i.name,
        i.sku,
        i.purchase_cost,
        i.active,
        i.cost_per_base_unit,
        pu.symbol AS purchase_unit,
        bu.symbol AS base_unit,
        c.name AS category_name
      FROM items i
      INNER JOIN units pu ON i.purchase_unit_id = pu.id
      INNER JOIN units bu ON i.base_unit_id = bu.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.org_id = $1;
      `,
      [orgId],
    );

    return result.rows;
  }

  async getItemById(orgId: string, itemId: string): Promise<ItemRow> {
    const result: QueryResult<ItemRow> = await this.pool.query(
      `
      SELECT *
      FROM items
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, itemId],
    );

    const item = result.rows[0];
    if (!item) {
      throw new NotFoundException('Item not found in this organization');
    }
    return item;
  }

  async updateItem(
    orgId: string,
    userId: string,
    itemId: string,
    dto: UpdateItemDto,
  ): Promise<ItemRow> {
    const allowedFields: (keyof UpdateItemDto)[] = [
      'name',
      'sku',
      'purchase_unit_id',
      'purchase_qty',
      'purchase_cost',
      'category_id',
      'base_unit_id',
      'base_qty_per_purchase',
      'active',
    ];

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (field in dto && dto[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(dto[field]);
        idx += 1;
      }
    }

    if (updates.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    values.push(userId);
    values.push(orgId);
    values.push(itemId);

    const result: QueryResult<ItemRow> = await this.pool.query(
      `
      UPDATE items
      SET ${updates.join(', ')}, updated_at = now(), updated_by = $${idx}
      WHERE org_id = $${idx + 1} AND id = $${idx + 2}
      RETURNING *;
      `,
      values,
    );

    const item = result.rows[0];
    if (!item) {
      throw new NotFoundException('Item not found in this organization');
    }

    await this.pool.query(
      `
      UPDATE items
      SET cost_per_base_unit = purchase_cost::numeric / NULLIF(base_qty_per_purchase::numeric, 0)
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, itemId],
    );

    return item;
  }

  async deleteItem(orgId: string, itemId: string): Promise<void> {
    const result = await this.pool.query(
      `
      DELETE FROM items
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, itemId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Item not found in this organization');
    }
  }

  async getUnits(): Promise<UnitRow[]> {
    const result: QueryResult<UnitRow> =
      await this.pool.query(`SELECT * FROM units;`);
    if (!result.rowCount) {
      throw new NotFoundException('No units found');
    }
    return result.rows;
  }
}
