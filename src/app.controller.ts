/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
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

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/user/signin')
  async userSignIn(@Request() req, @Body() _: UserSignInDTO) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/user/signup')
  async userSignUp(@Request() req, @Body() _: UserSignUpDTO) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/org/signin')
  async orgSignIn(@Request() req, @Body() _: OrgSignInDTO) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/org/signup')
  async orgSignUp(@Request() req, @Body() _: OrgSignUpDTO) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('hello')
  getHello(): string {
    return 'Hello World';
  }
}
