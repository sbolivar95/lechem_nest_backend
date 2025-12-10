/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/employees/dto/create-employee.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { OrgRole } from 'src/auth/enum/roles.enum';

export class CreateEmployeeDto {
  @IsEmail()
  email!: string;

  // This is the plain password coming from the client
  @IsString()
  @IsNotEmpty()
  password_hash!: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsString()
  @IsNotEmpty()
  role!: OrgRole; // OWNER / MANAGER / EMPLOYEE
}
