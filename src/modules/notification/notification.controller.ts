import { Controller, Get, Post, Body, UseGuards, Req, Query, Patch, Param } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { InternalNotificationDto } from './dto/internal-notification.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  getUserNotifications(
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.notificationService.getUserNotifications(req.user.id, +limit, +offset);
  }

  @Post('internal')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'support_admin')
  sendInternal(
    @Req() req: requestWithUserInterface.RequestWithUser,
    @Body() dto: InternalNotificationDto,
  ) {
    if (dto.userId) {
      return this.notificationService.sendInternal(dto.userId, dto);
    }
    return this.notificationService.sendBroadcast(dto);
  }

  @Post('email')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'support_admin')
  async sendEmail(@Body() dto: SendEmailDto) {
    await this.notificationService.sendEmail(null, dto.to, dto.subject, dto.html);
    return { message: 'ایمیل در حال ارسال است' };
  }

  @Post('sms')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'support_admin')
  async sendSms(@Body() dto: SendSmsDto) {
    await this.notificationService.sendSms(null, dto.to, dto.templateId, dto.params);
    return { message: 'پیامک در حال ارسال است' };
  }
}
