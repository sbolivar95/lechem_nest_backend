// auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Pool, QueryResult } from 'pg';
import { Inject } from '@nestjs/common';
import { PG_POOL } from 'src/db/db.module';
import { config } from 'src/config/env';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { OrgMemberRow, OrgRow, UserRow } from './types/auth.types';
import { LoginDto } from './dto/login.dto';

const jwtSecret: Secret = (() => {
  if (!config.jwtSecret) {
    // Fail fast if misconfigured
    throw new Error('JWT secret is not configured');
  }
  return config.jwtSecret as Secret;
})();

interface JwtPayload {
  userId: number;
  activeOrgId: number;
  orgRole: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  private signToken(payload: JwtPayload): string {
    const expiresIn: SignOptions['expiresIn'] =
      (config.jwtExpiresIn as unknown as SignOptions['expiresIn']) ?? '1d';
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, jwtSecret, options);
  }

  async registerOwner(dto: RegisterOwnerDto) {
    const { email, password, fullName, organizationName } = dto;

    if (!email || !password || !fullName || !organizationName) {
      throw new BadRequestException('All fields are required');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const hashed = await bcrypt.hash(password, config.bcryptRounds);

      const userResult: QueryResult<Pick<UserRow, 'id' | 'email'>> =
        await client.query(
          `INSERT INTO users (email, password_hash, full_name)
         VALUES ($1, $2, $3)
         RETURNING id, email`,
          [email, hashed, fullName],
        );
      const user = userResult.rows[0];

      const orgResult: QueryResult<Pick<OrgRow, 'id' | 'org_name'>> =
        await client.query(
          `INSERT INTO organizations (org_name)
         VALUES ($1)
         RETURNING id, org_name`,
          [organizationName],
        );
      const org = orgResult.rows[0];

      const memberResult: QueryResult<Pick<OrgMemberRow, 'id' | 'role'>> =
        await client.query(
          `INSERT INTO organization_members (user_id, org_id, role)
         VALUES ($1, $2, 'OWNER')
         RETURNING id, role`,
          [user.id, org.id],
        );

      const member = memberResult.rows[0];

      await client.query('COMMIT');

      const token = this.signToken({
        userId: user.id,
        activeOrgId: org.id,
        orgRole: member.role,
      });

      return {
        token,
        user: { id: user.id, email: user.email },
        organization: { id: org.id, name: org.org_name },
        role: member.role,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async login(dto: LoginDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('email and password required');
    }

    const userResult: QueryResult<UserRow> = await this.pool.query(
      `SELECT id, email, full_name, password_hash
       FROM users
       WHERE email = $1`,
      [dto.email],
    );

    if (userResult.rowCount === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = userResult.rows[0];
    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const memberResult: QueryResult<OrgMemberRow> = await this.pool.query(
      `SELECT org_id, role
       FROM organization_members
       WHERE user_id = $1
       ORDER BY id
       LIMIT 1`,
      [user.id],
    );

    if (memberResult.rowCount === 0) {
      throw new BadRequestException('User has no organization memberships');
    }

    const membership = memberResult.rows[0];
    const token = this.signToken({
      userId: user.id,
      activeOrgId: membership.org_id,
      orgRole: membership.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roles: [membership.role],
      },
      organization: { id: membership.org_id },
      role: membership.role,
    };
  }

  async loadUserOrganizations(userId: string) {
    if (!userId) {
      throw new BadRequestException('user identification is required');
    }

    const result: QueryResult<OrgRow> = await this.pool.query(
      `SELECT
         o.*,
         m.id AS member_id,
         m.role
       FROM organization_members AS m
       INNER JOIN organizations AS o
         ON o.id = m.org_id
       WHERE m.user_id = $1
       ORDER BY o.org_name`,
      [userId],
    );

    return result.rows;
  }

  async me(userId: string, activeOrgId: number, role: string) {
    const userResult: QueryResult<UserRow> = await this.pool.query(
      `SELECT id, email, full_name FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rowCount === 0) {
      throw new NotFoundException('User not found');
    }

    const user = userResult.rows[0];

    const orgResult: QueryResult<OrgRow> = await this.pool.query(
      `SELECT id, org_name FROM organizations WHERE id = $1`,
      [activeOrgId],
    );
    const org = orgResult.rows[0] || null;

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      organization: org,
      role,
    };
  }
}
