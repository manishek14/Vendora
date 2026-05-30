import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'user_admin', 'finance_admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('orders')
  getOrderStats() {
    return this.adminService.getOrderStats();
  }
}
