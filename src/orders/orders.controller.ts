// src/orders/orders.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { type JwtRequest } from 'src/auth/guards/jwt-auth.guard';
import { type OrderStatus } from './interface/order.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer endpoint (create PENDING order)
  @Post(':orgId/create')
  create(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateOrderDto,
  ) {
    // if you're logged-in, you can inject current user in a decorator
    // and pass dto.customerId = user.id
    return this.ordersService.create(orgId, dto);
  }

  // OWNER/MANAGER
  @Get(':orgId/list')
  findAll(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(orgId, status);
  }

  // OWNER/MANAGER (or customer checking their own order)
  @Get(':orgId/:orderId/detail')
  findOne(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findOne(orgId, orderId);
  }

  // OWNER/MANAGER approve / reject / cancel
  @Patch(':orgId/:orderId/status')
  updateStatus(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() _req: JwtRequest,
  ) {
    // here you should inject the current organization_member_id (from JWT/session)
    return this.ordersService.updateStatus(orgId, orderId, dto, _req.user.id);
  }

  // maybe only allow delete for test / dev, or require special permission
  @Delete(':orgId/:orderId/delete')
  remove(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.remove(orgId, orderId);
  }
}
