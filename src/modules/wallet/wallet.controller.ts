import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';
import { Req } from '@nestjs/common';

@Controller('admin/wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('finance_admin', 'super_admin')
export class AdminWalletController {
  constructor(private walletService: WalletService) {}

  @Get('withdrawals/pending')
  async getPendingWithdrawals() {
    return this.walletService.getPendingWithdrawals();
  }

  @Put('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string, @Req() req: requestWithUserInterface.RequestWithUser) {
    await this.walletService.approveWithdrawal(+id, req.user.id);
    return { message: 'درخواست برداشت تأیید و پردازش شد' };
  }

  @Post('withdrawals/:id/reject')
  async rejectWithdrawal(@Param('id') id: string, @Body('reason') reason: string, @Req() req: requestWithUserInterface.RequestWithUser) {
    await this.walletService.rejectWithdrawal(+id, req.user.id, reason);
    return { message: 'درخواست برداشت رد شد' };
  }
}