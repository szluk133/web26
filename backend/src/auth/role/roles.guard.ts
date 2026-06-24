import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/auth/role/roles.decorator';
import { Role } from '@/auth/role/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        // Nếu API không yêu cầu role cụ thể thì cho qua
        if (!requiredRoles) {
            return true;
        }
        
        const { user } = context.switchToHttp().getRequest();
        
        if (!user) {
            throw new ForbiddenException('Không tìm thấy thông tin người dùng.');
        }

        const hasRole = requiredRoles.some((role) => user.role === role);
        if (!hasRole) {
            throw new ForbiddenException('Bạn không có quyền (Role) để thực hiện hành động này.');
        }

        return true;
    }
}