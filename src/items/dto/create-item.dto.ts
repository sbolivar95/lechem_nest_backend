/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/items/dto/create-item.dto.ts
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string | null;

  @IsUUID()
  purchase_unit_id!: string;

  @IsNumber()
  purchase_qty!: number;

  @IsNumber()
  purchase_cost!: number;

  @IsUUID()
  base_unit_id!: string;

  @IsNumber()
  base_qty_per_purchase!: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsUUID()
  category_id?: string;
}
