import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRow } from './interface/category.interface';
import { Pool, QueryResult } from 'pg';
import { PG_POOL } from 'src/db/db.module';

@Injectable()
export class CategoriesService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(orgId: number, dto: CreateCategoryDto): Promise<CategoryRow> {
    const { name } = dto;

    if (!name) {
      throw new BadRequestException('Name is required');
    }

    const result: QueryResult<CategoryRow> = await this.pool.query(
      `
      INSERT INTO categories (org_id, name)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [orgId, name],
    );

    return result.rows[0];
  }

  async findAll(orgId: number): Promise<CategoryRow[]> {
    const result: QueryResult<CategoryRow> = await this.pool.query(
      `
      SELECT id, org_id, name
      FROM categories
      WHERE org_id = $1;
      `,
      [orgId],
    );

    return result.rows;
  }

  async findOne(orgId: number, id: number) {
    const result: QueryResult<CategoryRow> = await this.pool.query(
      `
      SELECT id, org_id, name
      FROM categories
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, id],
    );

    return result.rows;
  }

  async update(
    orgId: number,
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryRow> {
    const allowedFields = ['name'];
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (dto[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(dto[field]);
        idx++;
      }
    }
    if (updates.length === 0) {
      throw new BadRequestException('No valid fields to update');
    }
    values.push(id);
    values.push(orgId);

    const result: QueryResult<CategoryRow> = await this.pool.query<CategoryRow>(
      `
      UPDATE categories
      SET ${updates.join(', ')}
      WHERE id = $${idx} and orgId = $${idx + 1}
      RETURNING *;
    `,
      values,
    );

    return result.rows[0];
  }

  async remove(orgId: number, itemId: number): Promise<void> {
    const result = await this.pool.query(
      `
      DELETE FROM categories
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, itemId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Item not found in this organization');
    }
  }
}
