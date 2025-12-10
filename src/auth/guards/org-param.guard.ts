// src/auth/guards/org-param.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { JwtRequest } from './jwt-auth.guard';

export function OrgParamGuard(paramName: string): Type<CanActivate> {
  @Injectable()
  class OrgParamGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<JwtRequest>();
      const params = request.params ?? {};
      const requestedOrgId = params[paramName];

      const userOrgId = request.user?.activeOrgId;
      if (!requestedOrgId || !userOrgId) {
        throw new ForbiddenException('Organization context missing');
      }

      // If ids are UUID strings everywhere, cast to string
      if (String(requestedOrgId) !== String(userOrgId)) {
        throw new ForbiddenException('Organization mismatch');
      }

      return true;
    }
  }

  return mixin(OrgParamGuardMixin);
}
