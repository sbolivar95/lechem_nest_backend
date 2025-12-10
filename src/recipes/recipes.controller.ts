// src/recipes/recipes.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard, type JwtRequest } from '../auth/guards/jwt-auth.guard';
import { OrgParamGuard } from '../auth/guards/org-param.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Req } from '@nestjs/common';
import { OrgRole } from 'src/auth/enum/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  // POST /orgs/:orgId/:userCode/recipes/create
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Post(':orgId/recipes/create')
  createRecipe(
    @Param('orgId') orgId: string,
    @Body() dto: CreateRecipeDto,
    @Req() _req: JwtRequest,
  ) {
    return this.recipesService.createRecipe(orgId, _req.user.id, dto);
  }

  // GET /orgs/:orgId/recipes/return_list
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/recipes/return_list')
  listRecipes(@Param('orgId') orgId: string) {
    return this.recipesService.listRecipes(orgId);
  }

  // GET /orgs/:orgId/recipes/:recipeId/return_single_recipe
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/recipes/:recipeId/return_single_recipe')
  getRecipeById(
    @Param('orgId') orgId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.recipesService.getRecipeById(orgId, recipeId);
  }

  // PATCH /orgs/:orgId/:userCode/recipes/:recipeId/update_recipe
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Patch(':orgId/:userCode/recipes/:recipeId/update_recipe')
  updateRecipe(
    @Param('orgId') orgId: string,
    @Param('userCode') userCode: string,
    @Param('recipeId') recipeId: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipesService.updateRecipe(orgId, recipeId, userCode, dto);
  }

  // DELETE /orgs/:orgId/recipes/:recipeId/delete_recipe
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/recipes/:recipeId/delete_recipe')
  deleteRecipe(
    @Param('orgId') orgId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.recipesService.deleteRecipe(orgId, recipeId);
  }

  // GET /orgs/:orgId/recipes/:recipeId/items
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Get(':orgId/recipes/:recipeId/items')
  listRecipeItems(
    @Param('orgId') orgId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.recipesService.listRecipeItems(orgId, recipeId);
  }

  // PUT /orgs/:orgId/recipes/:recipeId/items/:itemId/update_recipe_item
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Put(':orgId/recipes/:recipeId/items/:itemId/update_recipe_item')
  upsertRecipeItem(
    @Param('orgId') orgId: string,
    @Param('recipeId') recipeId: string,
    @Param('itemId') itemId: string,
    @Body('qty_g') qty_g: number,
    @Body('waste_pct') waste_pct?: number,
  ) {
    return this.recipesService.upsertRecipeItem(
      orgId,
      recipeId,
      itemId,
      qty_g,
      waste_pct ?? 0,
    );
  }

  // DELETE /orgs/:orgId/recipes/:recipeId/items/:itemId/delete_recipe_item
  @UseGuards(OrgParamGuard('orgId'))
  @Roles(OrgRole.OWNER, OrgRole.MANAGER)
  @Delete(':orgId/recipes/:recipeId/items/:itemId/delete_recipe_item')
  deleteRecipeItem(
    @Param('orgId') orgId: string,
    @Param('recipeId') recipeId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.recipesService.deleteRecipeItem(orgId, recipeId, itemId);
  }
}
