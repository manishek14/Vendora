import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { RegisterLocalDto } from './dto/register-local.dto';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { code: string; expires: number }>();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerLocal(dto: RegisterLocalDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('ایمیل قبلاً ثبت شده است');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.createUser({
      email: dto.email,
      fullName: dto.fullName,
      password: hashedPassword,
      isEmailVerified: false,
      isPhoneVerified: false,
    });
    return this.generateTokens(user);
  }

  async validateLocalUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.password) return null;
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    return user;
  }

  async loginLocal(user: any) {
    return this.generateTokens(user);
  }

  async requestOtp(phone: string) {
    const existingUser = await this.userService.findByPhone(phone);
    const code = randomInt(100000, 999999).toString();
    const expires = Date.now() + 2 * 60 * 1000;
    this.otpStore.set(phone, { code, expires });
    console.log(`کد تأیید برای ${phone}: ${code}`);
    return { message: 'کد با موفقیت ارسال شد', isNewUser: !existingUser };
  }

  async verifyOtp(phone: string, code: string) {
    const record = this.otpStore.get(phone);
    if (!record || record.code !== code || Date.now() > record.expires) {
      throw new BadRequestException('کد نامعتبر یا منقضی شده است');
    }
    this.otpStore.delete(phone);

    let user = await this.userService.findByPhone(phone);
    if (!user) {
      user = await this.userService.createUser({
        phone,
        isPhoneVerified: true,
      });
    } else {
      if (!user.isPhoneVerified) {
        await this.userService.verifyPhone(user.id);
      }
    }
    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret')!,
      expiresIn: this.configService.get<string>('jwt.refreshExpires')! as any,
    });
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret')!,
      });
      const user = await this.userService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('رفرش توکن نامعتبر است');
    }
  }
}