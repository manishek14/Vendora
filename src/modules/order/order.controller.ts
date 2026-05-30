import { Controller, Post, Get, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  createOrder(
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(req.user.id, dto);
  }

  @Get()
  getUserOrders(@Req() req: requestWithUserInterface.RequestWithUser) {
    return this.orderService.getUserOrders(req.user.id);
  }

  @Get(':id')
  getOrderById(
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Param('id') id: string,
  ) {
    const isAdmin = req.user.roles?.some((r) =>
      ['super_admin', 'finance_admin'].includes(r.name),
    ) ?? false;
    return this.orderService.getOrderById(req.user.id, +id, isAdmin);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'finance_admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(+id, dto.status);
  }
}
