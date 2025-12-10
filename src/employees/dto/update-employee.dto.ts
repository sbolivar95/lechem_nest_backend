/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/employees/dto/update-employee.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { OrgRole } from '../../auth/enum/roles.enum';

export class UpdateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  role!: OrgRole;
}
