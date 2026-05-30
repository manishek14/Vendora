import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(+productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('product/:productId')
  create(
    @Param('productId') productId: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(req.user.id, +productId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('product_admin', 'super_admin')
  @Get('pending')
  findPending() {
    return this.reviewService.findPending();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('product_admin', 'super_admin')
  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.reviewService.approve(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: requestWithUserInterface.RequestWithUser,
  ) {
    const isAdmin = req.user.roles?.some((r) => ['product_admin', 'super_admin'].includes(r.name)) ?? false;
    return this.reviewService.remove(+id, req.user.id, isAdmin);
  }
}
