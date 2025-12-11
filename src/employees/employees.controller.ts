// src/employees/employees.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgParamGuard } from '../auth/guards/org-param.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrgRole } from '../auth/enum/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // GET /orgs/:orgId/return_list
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/return_list')
  listEmployees(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.employeesService.listEmployees(orgId);
  }

  // GET /orgs/:orgId/:memberId/return_single_employee
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/:memberId/return_single_employee')
  getEmployeeById(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('memberId') memberId: string,
  ) {
    return this.employeesService.getEmployeeById(orgId, memberId);
  }

  // POST /orgs/:orgId/create
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Post(':orgId/create')
  createEmployee(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeesService.createEmployee(orgId, dto);
  }

  // PATCH /orgs/:orgId/:memberId/update_employee
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Patch(':orgId/:memberId/update_employee')
  updateEmployee(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateEmployee(orgId, memberId, dto);
  }

  // DELETE /orgs/:orgId/:memberId/delete_employee
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/:memberId/delete_employee')
  deleteEmployee(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Param('memberId') memberId: string,
  ) {
    return this.employeesService.deleteEmployee(orgId, memberId);
  }
}
