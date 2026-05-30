import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterLocalDto } from './dto/register-local.dto';
import { LoginLocalDto } from './dto/login-local.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LocalAuthGuard } from '../../common/guard/local-auth.guard'; // در ادامه می‌سازیم
import * as requestWithUserInterface from '../../common/interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/local')
  async registerLocal(@Body() dto: RegisterLocalDto) {
    return this.authService.registerLocal(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async loginLocal(@Req() req: requestWithUserInterface.RequestWithUser) {
    return this.authService.loginLocal(req.user);
  }

  @Post('login/phone')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.phone);
  }

  @Post('verify/otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}