import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll(
    @Query() filters: ProductFilterDto,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1,
  ) {
    return this.productService.findAll(filters, limit, page);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'product_admin')
  async create(
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'product_admin')
  async update(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() dto: UpdateProductDto,
  ) {
    const isAdmin =
      req.user.roles?.some((r) => r.name === 'product_admin') ?? false;
    return this.productService.update(+id, req.user.id, dto, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'product_admin')
  async remove(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const isAdmin =
      req.user.roles?.some((r) => r.name === 'product_admin') ?? false;
    await this.productService.remove(+id, req.user.id, isAdmin);
    return { message: 'محصول حذف شد' };
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('product_admin')
  async approve(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    return this.productService.approve(+id, req.user.id);
  }
}
