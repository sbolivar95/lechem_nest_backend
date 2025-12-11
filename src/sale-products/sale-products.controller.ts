// src/sale-products/sale-products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateSaleProductDto } from './dto/create-sale-product.dto';
import { UpdateSaleProductDto } from './dto/update-sale-product.dto';
import { SaleProductsService } from './sale-products.service';

@Controller('sale-products')
export class SaleProductsController {
  constructor(private readonly saleProductsService: SaleProductsService) {}

  // Add role guards here (OWNER/MANAGER)
  @Post(':orgId/create')
  create(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateSaleProductDto,
  ) {
    return this.saleProductsService.create(orgId, dto);
  }

  // Public or authenticated customer
  @Get(':orgId/list')
  findAll(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.saleProductsService.findAll(orgId);
  }

  @Get(':orgId/:id/detail')
  findOne(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id') id: string,
  ) {
    return this.saleProductsService.findOne(orgId, id);
  }

  // OWNER/MANAGER only
  @Patch(':orgId/:id/update')
  update(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('id') id: string,
    @Body() dto: UpdateSaleProductDto,
  ) {
    return this.saleProductsService.update(orgId, id, dto);
  }

  // OWNER/MANAGER only
  @Delete(':orgId/:id/delete')
  remove(@Param('orgId', ParseIntPipe) orgId: number, @Param('id') id: string) {
    return this.saleProductsService.remove(orgId, id);
  }
}
