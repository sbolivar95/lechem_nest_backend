// src/products/products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard, type JwtRequest } from '../auth/guards/jwt-auth.guard';
import { OrgParamGuard } from '../auth/guards/org-param.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrgRole } from 'src/auth/enum/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /orgs/:orgId/:userCode/create_product
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Post(':orgId/create_product')
  createProduct(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateProductDto,
    @Req() _req: JwtRequest,
  ) {
    return this.productsService.createProduct(orgId, _req.user.id, dto);
  }

  // GET /orgs/:orgId/return_product_list
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/return_product_list')
  listProducts(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.productsService.listProducts(orgId);
  }

  // GET /orgs/:orgId/products/:productId/return_single_product
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/products/:productId/return_single_product')
  getProductById(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('productId') productId: string,
  ) {
    return this.productsService.getProductById(orgId, productId);
  }

  // PATCH /orgs/:orgId/products/:productId/update_product
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Patch(':orgId/products/:productId/update_product')
  updateProduct(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @Body('userCode') userCode?: string, // or param if you want
  ) {
    // original Express route had :userCode on path for update; if you keep that,
    // change signature to @Param('userCode') userCode: string and adjust route
    return this.productsService.updateProduct(
      orgId,
      userCode ?? '',
      productId,
      dto,
    );
  }

  // DELETE /orgs/:orgId/products/:productId/delete_product
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/products/:productId/delete_product')
  deleteProduct(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('productId') productId: string,
  ) {
    return this.productsService.deleteProduct(orgId, productId);
  }

  // DELETE /orgs/:orgId/products/:productId/recipes/:recipeId/delete_product_recipe
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/products/:productId/recipes/:recipeId/delete_product_recipe')
  deleteProductRecipe(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('productId') productId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.productsService.deleteProductRecipe(orgId, productId, recipeId);
  }

  // DELETE /orgs/:orgId/products/:productId/items/:itemId/delete_product_item
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/products/:productId/items/:itemId/delete_product_item')
  deleteProductItem(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('productId') productId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.productsService.deleteProductItem(orgId, productId, itemId);
  }
}
