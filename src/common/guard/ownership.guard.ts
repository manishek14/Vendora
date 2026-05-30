import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const OWNERSHIP_KEY = 'ownershipParam';
export const CheckOwnership = (paramName = 'userId') =>
  SetMetadata(OWNERSHIP_KEY, paramName);

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramName = this.reflector.get<string>(OWNERSHIP_KEY, context.getHandler());
    if (!paramName) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // admins bypass ownership check
    const isAdmin = user.roles?.some((r: any) =>
      ['super_admin', 'user_admin', 'product_admin', 'finance_admin', 'support_admin'].includes(r.name),
    );
    if (isAdmin) return true;

    const resourceUserId = request.params[paramName] ?? request.body[paramName];
    if (resourceUserId && Number(resourceUserId) !== user.id) {
      throw new ForbiddenException('شما مجاز به دسترسی به این منبع نیستید');
    }
    return true;
  }
}
