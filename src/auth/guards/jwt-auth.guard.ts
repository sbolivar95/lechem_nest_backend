/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import jwt, { JwtPayload as JwtLibPayload, Secret } from 'jsonwebtoken';
import { config } from 'src/config/env';
import { JwtUser } from '../types/jwt.types';

export interface JwtRequest extends Request {
  user: JwtUser;
}

interface AppJwtPayload extends JwtLibPayload {
  userId: string;
  activeOrgId: number;
  orgRole: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<JwtRequest>();
    const authHeader = request.headers['authorization'];

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.slice(7);

    const secret: Secret = config.jwtSecret as Secret;
    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }
    try {
      const decoded = jwt.verify(token, secret) as AppJwtPayload;

      request.user = {
        id: decoded.userId,
        activeOrgId: decoded.activeOrgId,
        role: decoded.orgRole,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
