import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { DENY_ROLES_KEY } from 'src/common/decorators/deny-roles.decorator';
import { Request, Response } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const denyRoles = this.reflector.getAllAndOverride<string[]>(
      DENY_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const role = (request.user as { role?: string } | undefined)?.role;

    if (denyRoles && typeof role === 'string' && denyRoles.includes(role)) {
      if (role === 'super_admin') {
        response.redirect('/information');
      } else if (role === 'admin') {
        response.redirect('/program');
      } else {
        response.redirect('/');
      }
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    return typeof role === 'string' && requiredRoles.includes(role);
  }
}
