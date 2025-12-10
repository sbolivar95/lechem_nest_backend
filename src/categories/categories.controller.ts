import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrgParamGuard } from 'src/auth/guards/org-param.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OrgRole } from 'src/auth/enum/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Post(':orgId/create')
  create(@Param('orgId') orgId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(orgId, dto);
  }

  @UseGuards(JwtAuthGuard, OrgParamGuard('orgId'))
  @Get(':orgId/find_all')
  findAll(@Param('orgId') orgId: string) {
    return this.categoriesService.findAll(orgId);
  }

  @UseGuards(JwtAuthGuard, OrgParamGuard('orgId'))
  @Get(':id/:orgId/find_one')
  findOne(@Param('id') id: number, @Param('orgId') orgId: number) {
    return this.categoriesService.findOne(orgId, id);
  }

  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Patch(':orgId/:id/update')
  update(
    @Param('id') id: number,
    @Param('orgId') orgId: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(orgId, id, dto);
  }

  @UseGuards(RolesGuard, JwtAuthGuard, OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/:id/delete')
  remove(@Param('id') id: number, @Param('orgId') orgId: number) {
    return this.categoriesService.remove(orgId, id);
  }

  @UseGuards(JwtAuthGuard, OrgParamGuard('orgId'))
  @Get(':orgId/health')
  healthCheck() {
    return { status: 'Categories service is healthy' };
  }
}
