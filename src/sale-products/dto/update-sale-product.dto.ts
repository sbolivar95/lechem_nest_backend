import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleProductDto } from './create-sale-product.dto';

export class UpdateSaleProductDto extends PartialType(CreateSaleProductDto) {}
