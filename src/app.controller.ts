/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, UseGuards, Req, Post, Body } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  OrgSignInDTO,
  OrgSignUpDTO,
  UserSignInDTO,
  UserSignUpDTO,
} from './auth/dto/auth.dto';
import { PrismaService } from './prisma.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/user/signin')
  async userSignIn(@Req() req: Request, @Body() _: UserSignInDTO) {
    // @ts-ignore
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/user/signup')
  async userSignUp(@Req() req: Request, @Body() _: UserSignUpDTO) {
    // @ts-ignore
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/org/signin')
  async orgSignIn(@Req() req: Request, @Body() _: OrgSignInDTO) {
    // @ts-ignore
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/org/signup')
  async orgSignUp(@Req() req: Request, @Body() _: OrgSignUpDTO) {
    // @ts-ignore
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  getProfile(@Req() req: Request) {
    // @ts-ignore
    return req.user;
  }

  @Get('hello')
  async getHello() {
    return 'Hello World!';
  }
}
