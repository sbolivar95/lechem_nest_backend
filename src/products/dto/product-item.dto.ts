/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/products/dto/product-item.dto.ts
import { IsNumber, IsUUID } from 'class-validator';

export class ProductRecipeInputDto {
  @IsUUID()
  recipe_id!: string;

  @IsNumber()
  qty_g!: number;
}

export class ProductItemInputDto {
  @IsUUID()
  item_id!: string;

  @IsNumber()
  qty_g!: number;
}
