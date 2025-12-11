// src/items/items.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard, type JwtRequest } from '../auth/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrgRole } from 'src/auth/enum/roles.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OrgParamGuard } from 'src/auth/guards/org-param.guard';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // POST /orgs/:orgId/items/create
  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Post(':orgId/items/create')
  createItem(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateItemDto,
    @Req() _req: JwtRequest,
  ) {
    // orgId ownership/role checks can be done with extra guards similar to requireOrgMatchFromParam/requireRole
    return this.itemsService.createItem(orgId, dto, _req.user.id);
  }

  // GET /orgs/:orgId/items/get
  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Get(':orgId/items/get')
  listItems(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.itemsService.listItems(orgId);
  }

  // GET /orgs/:orgId/items/:itemId/get_by_id
  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Get(':orgId/items/:itemId/get_by_id')
  getItemById(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('itemId') itemId: string,
  ) {
    return this.itemsService.getItemById(orgId, itemId);
  }

  // PATCH /orgs/:orgId/items/:itemId/update
  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Patch(':orgId/items/:itemId/update')
  updateItem(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
    @Req() _req: JwtRequest,
  ) {
    return this.itemsService.updateItem(orgId, _req.user.id, itemId, dto);
  }

  // DELETE /orgs/:orgId/items/:itemId/delete
  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/items/:itemId/delete')
  deleteItem(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('itemId') itemId: string,
  ) {
    return this.itemsService.deleteItem(orgId, itemId);
  }

  // GET /orgs/units (kept same as /items/units original prefix-wise)
  @UseGuards(JwtAuthGuard)
  @Get('units')
  getUnits() {
    return this.itemsService.getUnits();
  }
}
