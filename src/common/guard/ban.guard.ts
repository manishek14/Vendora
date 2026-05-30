import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ViolationService } from '../../modules/violation/violation.service';

@Injectable()
export class BanGuard implements CanActivate {
  constructor(private violationService: ViolationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) return true;

    const { isBanned, remainingDays, reason } = await this.violationService.checkBanStatus(user.id);
    if (isBanned) {
      let message = `حساب شما مسدود شده است. دلیل: ${reason}`;
      if (remainingDays) message += ` (مدت باقی‌مانده: ${remainingDays} روز)`;
      throw new ForbiddenException(message);
    }
    return true;
  }
}