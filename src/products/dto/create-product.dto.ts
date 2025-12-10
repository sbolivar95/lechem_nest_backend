/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/products/dto/create-product.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductRecipeInputDto, ProductItemInputDto } from './product-item.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRecipeInputDto)
  recipes: ProductRecipeInputDto[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemInputDto)
  items: ProductItemInputDto[] = [];
}
