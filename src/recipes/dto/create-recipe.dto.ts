/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/recipes/dto/create-recipe.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemInputDto {
  @IsUUID()
  item_id!: string;

  @IsNumber()
  qty_g!: number;

  @IsOptional()
  @IsNumber()
  waste_pct?: number;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  yield_qty_g!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemInputDto)
  items!: RecipeItemInputDto[];
}
