import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Req() req: requestWithUserInterface.RequestWithUser) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  async addToCart(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto.productId, dto.quantity);
  }

  @Put('items/:id')
  async updateItem(@Req() req: requestWithUserInterface.RequestWithUser, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateQuantity(req.user.id, +id, dto.quantity);
  }

  @Delete('items/:id')
  async removeItem(@Req() req: requestWithUserInterface.RequestWithUser, @Param('id') id: string) {
    await this.cartService.removeItem(req.user.id, +id);
    return { message: 'آیتم از سبد خرید حذف شد' };
  }

  @Delete()
  async clearCart(@Req() req: requestWithUserInterface.RequestWithUser) {
    await this.cartService.clearCart(req.user.id);
    return { message: 'سبد خرید خالی شد' };
  }
}