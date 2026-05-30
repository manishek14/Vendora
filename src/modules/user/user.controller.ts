import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddPhoneDto } from './dto/add-phone.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { AddressDto } from './dto/address.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getProfile(@Req() req: requestWithUserInterface.RequestWithUser) {
    const user = await this.userService.findById(req.user.id);
    const { password, ...safeUser } = user;
    return safeUser;
  }

  @Put()
  async updateProfile(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Post('phone')
  async addPhone(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: AddPhoneDto) {
    await this.userService.addPhone(req.user.id, dto.phone);
    return { message: 'کد تأیید به شماره موبایل ارسال شد' };
  }

  @Post('phone/verify')
  async verifyPhone(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: VerifyPhoneDto) {
    await this.userService.verifyPhone(req.user.id);
    return { message: 'شماره موبایل تأیید شد' };
  }

  @Post('address')
  async addAddress(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: AddressDto) {
    return this.userService.addAddress(req.user.id, dto);
  }

  @Put('address/:id')
  async updateAddress(@Req() req: requestWithUserInterface.RequestWithUser, @Param('id') id: string, @Body() dto: AddressDto) {
    return this.userService.updateAddress(req.user.id, +id, dto);
  }

  @Delete('address/:id')
  async deleteAddress(@Req() req: requestWithUserInterface.RequestWithUser, @Param('id') id: string) {
    await this.userService.deleteAddress(req.user.id, +id);
    return { message: 'آدرس حذف شد' };
  }

  @Post('set-password')
  async setPassword(@Req() req: requestWithUserInterface.RequestWithUser, @Body() dto: SetPasswordDto) {
    await this.userService.setPassword(req.user.id, dto.password);
    return { message: 'رمز عبور با موفقیت تنظیم شد' };
  }
}