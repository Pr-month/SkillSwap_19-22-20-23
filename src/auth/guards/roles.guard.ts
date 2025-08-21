import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/user.enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем роли, заданные на методе или классе
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // Если роли не заданы, открываем доступ
      return true;
    }

    try {
      const request: AuthenticatedRequest = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        return false;
      }

      const hasRole = requiredRoles.some((role) => role === user.role);

      return hasRole;
    } catch {
      return false;
    }
  }
}
