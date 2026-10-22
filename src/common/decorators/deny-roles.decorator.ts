import { SetMetadata } from '@nestjs/common';

export const DENY_ROLES_KEY = 'deny_roles';
export const DenyRoles = (...roles: string[]) =>
  SetMetadata(DENY_ROLES_KEY, roles);
export const DenyRole = DenyRoles;
