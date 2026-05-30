import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ViolationService } from './violation.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateViolationItemDto } from './dto/create-violation-item.dto';
import { RegisterViolationDto } from './dto/register-violation.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@Controller('admin/violations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user_admin', 'super_admin')
export class ViolationController {
  constructor(private violationService: ViolationService) {}

  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.violationService.createCategory(dto);
  }

  @Get('categories')
  async getCategories() {
    return this.violationService.getCategories();
  }

  @Post('items')
  async createItem(@Body() dto: CreateViolationItemDto) {
    return this.violationService.createViolationItem(dto);
  }

  @Get('items')
  async getItems() {
    return this.violationService.getViolationItems();
  }

  @Post('users/:userId/violations')
  async registerViolation(@Req() req: requestWithUserInterface.RequestWithUser, @Param('userId') userId: string, @Body() dto: RegisterViolationDto) {
    return this.violationService.registerViolation(req.user.id, +userId, dto);
  }

  @Get('users/:userId/violations')
  async getUserViolations(@Param('userId') userId: string) {
    return this.violationService.getUserViolations(+userId);
  }

  @Post('users/ban')
  async banUser(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: BanUserDto) {
    return this.violationService.banUser(dto.userId, req.user.id, dto.punishmentType, dto.durationDays, dto.reason, dto.violationItemId);
  }

  @Put('users/:userId/unban')
  async unbanUser(@Req() req: requestWithUserInterface.RequestWithUser, @Param('userId') userId: string) {
    await this.violationService.unbanUser(+userId, req.user.id);
    return { message: 'بن کاربر لغو شد' };
  }

  @Get('bans/active')
  async getActiveBans() {
    return this.violationService.getActiveBans();
  }
}