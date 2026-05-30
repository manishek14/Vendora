import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingCostDto } from './dto/shipping-cost.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@Controller('shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Post('calculate')
  async calculate(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: ShippingCostDto) {
    return this.shippingService.calculateCost(dto.toCity, dto.totalWeightGr);
  }
}