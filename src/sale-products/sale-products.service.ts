// src/sale-products/sale-products.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PG_POOL } from 'src/db/db.module';
import { Pool, QueryResult } from 'pg';
import { CreateSaleProductDto } from './dto/create-sale-product.dto';
import { UpdateSaleProductDto } from './dto/update-sale-product.dto';
import { SaleProductRow } from './interface/sale-product.interface';

@Injectable()
export class SaleProductsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(
    orgId: number,
    dto: CreateSaleProductDto,
  ): Promise<SaleProductRow> {
    const id = crypto.randomUUID();

    const result: QueryResult<SaleProductRow> = await this.pool.query(
      `
      insert into sale_products (
        id, org_id, name, description, price_cents,
        currency, is_active, stock_quantity, created_at
      )
      values ($1, $2, $3, $4, $5, coalesce($6, 'USD'), 
              coalesce($7, true), $8, now())
      returning *
      `,
      [
        id,
        orgId,
        dto.name,
        dto.description ?? null,
        dto.priceCents,
        dto.currency ?? null,
        dto.isActive ?? null,
        dto.stockQuantity ?? null,
      ],
    );

    return result.rows[0];
  }

  async findAll(orgId: number): Promise<SaleProductRow[]> {
    const result: QueryResult<SaleProductRow> = await this.pool.query(
      `
      select *
      from sale_products
      where org_id = $1
      order by created_at desc
      `,
      [orgId],
    );
    return result.rows;
  }

  async findOne(orgId: number, id: string): Promise<SaleProductRow> {
    const result: QueryResult<SaleProductRow> = await this.pool.query(
      `
      select *
      from sale_products
      where org_id = $1 and id = $2
      `,
      [orgId, id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Sale product not found');
    }

    return result.rows[0];
  }

  async update(
    orgId: number,
    id: string,
    dto: UpdateSaleProductDto,
  ): Promise<SaleProductRow> {
    // build dynamic update (simple version for now)
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    function set(field: string, value: any) {
      fields.push(`${field} = $${idx++}`);
      values.push(value);
    }

    if (dto.name !== undefined) set('name', dto.name);
    if (dto.description !== undefined) set('description', dto.description);
    if (dto.priceCents !== undefined) set('price_cents', dto.priceCents);
    if (dto.currency !== undefined) set('currency', dto.currency);
    if (dto.isActive !== undefined) set('is_active', dto.isActive);
    if (dto.stockQuantity !== undefined)
      set('stock_quantity', dto.stockQuantity);
    set('updated_at', new Date());

    if (fields.length === 0) {
      return this.findOne(orgId, id);
    }

    values.push(orgId);
    values.push(id);

    const result: QueryResult<SaleProductRow> = await this.pool.query(
      `
      update sale_products
      set ${fields.join(', ')}
      where org_id = $${idx++} and id = $${idx}
      returning *
      `,
      values,
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Sale product not found');
    }

    return result.rows[0];
  }

  async remove(orgId: number, id: string) {
    const result = await this.pool.query(
      `
      delete from sale_products
      where org_id = $1 and id = $2
      returning *
      `,
      [orgId, id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Sale product not found');
    }
  }
}
