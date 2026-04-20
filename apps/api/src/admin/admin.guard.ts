import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@techfield/types';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (req.user?.role !== UserRole.PLATFORM_ADMIN) {
      throw new ForbiddenException('Se requiere rol de administrador de plataforma');
    }
    return true;
  }
}
