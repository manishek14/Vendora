import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('promo_admin', 'super_admin')
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Post()
  async create(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  @Get()
  async findAll() {
    return this.discountService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.discountService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateDiscountDto>) {
    return this.discountService.update(+id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.discountService.delete(+id);
    return { message: 'کد تخفیف حذف شد' };
  }
}