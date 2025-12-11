import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string; // sale_products.id

  @IsInt()
  @Min(1)
  quantity: number;
}
