import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    interface AuthRequest {
      isAuthenticated?: () => boolean;
    }
    const req = context.switchToHttp().getRequest<AuthRequest>();
    return Boolean(
      typeof req?.isAuthenticated === 'function' && req.isAuthenticated(),
    );
  }
}
