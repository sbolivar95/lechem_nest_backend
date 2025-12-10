// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, type JwtRequest } from './guards/jwt-auth.guard';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-owner')
  registerOwner(@Body() dto: RegisterOwnerDto) {
    return this.authService.registerOwner(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: JwtRequest) {
    const { id: userId, activeOrgId, role } = req.user;
    return this.authService.me(userId, activeOrgId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orgs')
  loadUserOrganizations(
    @Req() req: JwtRequest,
    @Query('userId') userId?: string,
  ) {
    return this.authService.loadUserOrganizations(
      userId ?? String(req.user.id),
    );
  }
}
