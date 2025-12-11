import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSaleProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsOptional()
  @IsString()
  currency?: string; // default 'USD' in DB

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number | null;
}
