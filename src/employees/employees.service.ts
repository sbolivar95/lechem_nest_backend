// src/employees/employees.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as bcrypt from 'bcryptjs';
import { PG_POOL } from '../db/db.module';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  OrgMemberRow,
  OrgMemberUpdateRow,
} from './interface/employee.interface';
import { config } from 'src/config/env';

@Injectable()
export class EmployeesService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async createEmployee(orgId: string, dto: CreateEmployeeDto): Promise<void> {
    if (!orgId) {
      throw new BadRequestException('Organization and User is required');
    }

    const { email, password_hash, full_name, role } = dto;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const hashed = await bcrypt.hash(password_hash, config.bcryptRounds);

      const userResult: QueryResult<{ id: string; email: string }> =
        await client.query(
          `
        INSERT INTO users (email, password_hash, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email;
        `,
          [email, hashed, full_name],
        );

      const user = userResult.rows[0];

      await client.query(
        `
        INSERT INTO organization_members (user_id, org_id, role)
        VALUES ($1, $2, $3)
        RETURNING id, role;
        `,
        [user.id, orgId, role],
      );

      await client.query('COMMIT');
      // 204 No Content in original API; here just return void
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listEmployees(orgId: string): Promise<OrgMemberRow[]> {
    if (!orgId) {
      throw new BadRequestException('Organization is required');
    }

    const client = await this.pool.connect();
    try {
      const result: QueryResult<OrgMemberRow> = await client.query(
        `
        SELECT om.id, u.email, u.full_name, om.role
        FROM organization_members om
        JOIN users u ON om.user_id = u.id
        WHERE om.org_id = $1;
        `,
        [orgId],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async getEmployeeById(
    orgId: string,
    memberId: string,
  ): Promise<OrgMemberRow> {
    if (!orgId || !memberId) {
      throw new BadRequestException('Organization and Member are required');
    }

    const client = await this.pool.connect();
    try {
      const memberResult: QueryResult<OrgMemberRow> = await client.query(
        `
        SELECT om.id, u.email, u.full_name, om.role
        FROM organization_members om
        JOIN users u ON om.user_id = u.id
        WHERE om.org_id = $1 AND om.id = $2;
        `,
        [orgId, memberId],
      );

      if (memberResult.rowCount === 0) {
        throw new NotFoundException('Member not found in this organization');
      }

      return memberResult.rows[0];
    } finally {
      client.release();
    }
  }

  async updateEmployee(
    orgId: string,
    memberId: string,
    dto: UpdateEmployeeDto,
  ): Promise<OrgMemberUpdateRow> {
    if (!orgId || !memberId) {
      throw new BadRequestException('Organization and Member are required');
    }

    const client = await this.pool.connect();
    try {
      const { role } = dto;

      const updateResult: QueryResult<OrgMemberUpdateRow> = await client.query(
        `
        UPDATE organization_members
        SET role = $1
        WHERE org_id = $2 AND id = $3
        RETURNING id, role;
        `,
        [role, orgId, memberId],
      );

      if (updateResult.rowCount === 0) {
        throw new NotFoundException('Member not found in this organization');
      }

      return updateResult.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteEmployee(orgId: string, memberId: string): Promise<void> {
    if (!orgId || !memberId) {
      throw new BadRequestException('Organization and Member are required');
    }

    const client = await this.pool.connect();

    await client.query('BEGIN');

    const deleteResult = await client.query(
      `
        DELETE FROM organization_members
        WHERE org_id = $1 AND id = $2
        RETURNING id;
        `,
      [orgId, memberId],
    );

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK');
      throw new NotFoundException('Member not found in this organization');
    }

    await client.query('COMMIT');
  }
}
