// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { OrgRole } from '../enum/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: OrgRole[]) => SetMetadata(ROLES_KEY, roles);
