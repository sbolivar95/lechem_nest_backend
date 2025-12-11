// src/recipes/recipes.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { CreateRecipeDto, RecipeItemInputDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PG_POOL } from 'src/db/db.module';
import {
  RecipeItemRow,
  RecipeListRow,
  RecipeRow,
} from './interface/recipes.interface';

@Injectable()
export class RecipesService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async createRecipe(
    orgId: number,
    userCode: string,
    dto: CreateRecipeDto,
  ): Promise<{ message: string; recipeId: string }> {
    if (!orgId || !userCode) {
      throw new BadRequestException('Organization and User is required');
    }

    const client = await this.pool.connect();
    try {
      const { name, description, yield_qty_g, items } = dto;

      await client.query('BEGIN');

      const recipeResult: QueryResult<{ id: string }> = await client.query(
        `
        INSERT INTO recipes (
          org_id,
          name,
          description,
          yield_qty_g,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
        `,
        [orgId, name, description ?? '', yield_qty_g, userCode],
      );

      const recipeId = recipeResult.rows[0].id;

      if (Array.isArray(items) && items.length > 0) {
        const safeItems: RecipeItemInputDto[] = items.map((x) => ({
          item_id: x.item_id,
          qty_g: x.qty_g,
          waste_pct: x.waste_pct ?? 0,
        }));

        await client.query(
          `
          INSERT INTO recipe_items (recipe_id, item_id, qty_g, waste_pct)
          SELECT
            $1,
            x.item_id,
            x.qty_g,
            x.waste_pct
          FROM jsonb_to_recordset($2::jsonb)
            AS x(item_id uuid, qty_g numeric, waste_pct numeric);
          `,
          [recipeId, JSON.stringify(safeItems)],
        );
      }

      await client.query('COMMIT');

      return { message: 'Recipe created', recipeId };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listRecipes(orgId: number): Promise<RecipeListRow[]> {
    const result: QueryResult<RecipeListRow> = await this.pool.query(
      `
      SELECT
        r.id,
        r.name,
        r.description,
        r.yield_qty_g,
        r.created_at,
        r.updated_at,
        SUM(ri.qty_g * i.cost_per_base_unit) AS total_recipe_cost,
        SUM(ri.qty_g * i.cost_per_base_unit) / r.yield_qty_g AS recipe_cost_per_gram,
        uc.full_name AS created_by,
        ub.full_name AS updated_by,
        COALESCE(
          json_agg(
            json_build_object(
              'item_id', ri.item_id,
              'qty_g', ri.qty_g,
              'recipe_id', ri.recipe_id,
              'waste_pct', ri.waste_pct,
              'name', i.name,
              'cost_per_base_unit', i.cost_per_base_unit
            )
          ) FILTER (WHERE ri.item_id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM recipes r
      INNER JOIN recipe_items ri ON r.id = ri.recipe_id
      INNER JOIN items i ON ri.item_id = i.id
      LEFT JOIN users uc ON r.created_by = uc.id
      LEFT JOIN users ub ON r.updated_by = ub.id
      WHERE r.org_id = $1
      GROUP BY
        r.id,
        r.name,
        r.description,
        r.yield_qty_g,
        r.created_by,
        r.created_at,
        r.updated_at,
        uc.full_name,
        ub.full_name
      ORDER BY r.name DESC;
      `,
      [orgId],
    );

    return result.rows;
  }

  async getRecipeById(orgId: number, recipeId: string): Promise<RecipeRow> {
    const result: QueryResult<RecipeRow> = await this.pool.query(
      `
      SELECT *
      FROM recipes
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, recipeId],
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundException('Recipe not found in this organization');
    }
    return recipe;
  }

  async updateRecipe(
    orgId: number,
    recipeId: string,
    userCode: string,
    dto: UpdateRecipeDto,
  ): Promise<RecipeRow> {
    const { ...rest } = dto;

    const allowedFields: (keyof UpdateRecipeDto)[] = [
      'name',
      'description',
      'yield_qty_g',
    ];
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (rest[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        values.push(rest[field]);
        idx += 1;
      }
    }

    if (!updates.length) {
      throw new BadRequestException('No valid fields to update');
    }

    values.push(orgId);
    values.push(recipeId);
    values.push(userCode);

    const result: QueryResult<RecipeRow> = await this.pool.query(
      `
      UPDATE recipes
      SET ${updates.join(', ')}, updated_at = now(), updated_by = $${idx + 2}
      WHERE org_id = $${idx} AND id = $${idx + 1}
      RETURNING *;
      `,
      values,
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundException('Recipe not found in this organization');
    }

    return recipe;
  }

  async deleteRecipe(orgId: number, recipeId: string): Promise<void> {
    const result = await this.pool.query(
      `
      DELETE FROM recipes
      WHERE org_id = $1 AND id = $2;
      `,
      [orgId, recipeId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Recipe not found in this organization');
    }
  }

  async listRecipeItems(
    orgId: number,
    recipeId: string,
  ): Promise<RecipeItemRow[]> {
    const result: QueryResult<RecipeItemRow> = await this.pool.query(
      `
      SELECT
        ri.recipe_id,
        ri.item_id,
        ri.qty_g,
        ri.waste_pct,
        i.name AS item_name,
        i.cost_per_base_unit
      FROM recipe_items ri
      JOIN recipes r ON r.id = ri.recipe_id
      JOIN items i ON i.id = ri.item_id
      WHERE r.org_id = $1
        AND ri.recipe_id = $2
      ORDER BY i.name;
      `,
      [orgId, recipeId],
    );

    return result.rows;
  }

  async upsertRecipeItem(
    orgId: number,
    recipeId: string,
    itemId: string,
    qty_g: number,
    waste_pct = 0,
  ): Promise<RecipeItemRow> {
    if (!qty_g) {
      throw new BadRequestException('qty_g is required');
    }

    const recipeCheck = await this.pool.query(
      `SELECT 1 FROM recipes WHERE org_id = $1 AND id = $2;`,
      [orgId, recipeId],
    );

    if (recipeCheck.rowCount === 0) {
      throw new NotFoundException('Recipe not found in this organization');
    }

    const result: QueryResult<RecipeItemRow> = await this.pool.query(
      `
      INSERT INTO recipe_items (recipe_id, item_id, qty_g, waste_pct)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (recipe_id, item_id)
      DO UPDATE SET
        qty_g = EXCLUDED.qty_g,
        waste_pct = EXCLUDED.waste_pct
      RETURNING recipe_id, item_id, qty_g, waste_pct,
                ''::text AS item_name,
                0::numeric AS cost_per_base_unit;
      `,
      [recipeId, itemId, qty_g, waste_pct],
    );

    return result.rows[0];
  }

  async deleteRecipeItem(
    orgId: number,
    recipeId: string,
    itemId: string,
  ): Promise<void> {
    const result = await this.pool.query(
      `
      DELETE FROM recipe_items
      USING recipes
      WHERE recipe_items.recipe_id = recipes.id
        AND recipes.org_id = $1
        AND recipe_items.recipe_id = $2
        AND recipe_items.item_id = $3;
      `,
      [orgId, recipeId, itemId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Recipe item not found in this organization');
    }
  }
}
