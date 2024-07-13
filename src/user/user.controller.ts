import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserProfileDTO } from './dto/update-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Get(':id/detailed')
  async getByIdDetailed(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findByIdDetailed(id);
  }

  @Get('orgs')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getUserOrgs() {
    // @ts-ignore
    const userId = req.user.id;
    return this.userService.getUserOrgs({
      userId,
    });
  }

  @Patch('/profile')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async updateOrgProfile(@Body() body: UpdateUserProfileDTO, @Request() req) {
    return this.userService.updateProfile({
      userId: req.user.id,
      data: body,
    });
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
