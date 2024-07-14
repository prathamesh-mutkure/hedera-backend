import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddUserToOrgDTO } from './dto/add-user-to-org.dto';
import { UpdateOrgProfileDTO } from './dto/update-profile.dto';
import { Request } from 'express';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('/users')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getOrgUsers(@Req() req: Request) {
    // @ts-ignore-next-line
    const orgId = req.user.id;
    return this.organizationService.getOrgUsers(orgId);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findById(id);
  }

  @Get(':id/detailed')
  async getByIdDetailed(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findByIdDetailed(id);
  }

  @Patch('/profile')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async updateOrgProfile(
    @Body() body: UpdateOrgProfileDTO,
    @Req() req: Request,
  ) {
    return this.organizationService.updateProfile({
      // @ts-ignore-next-line
      orgId: req.user.id,
      data: body,
    });
  }

  @Patch('user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async addUserToOrg(
    @Body() { userEmail }: AddUserToOrgDTO,
    @Req() req: Request,
  ) {
    return this.organizationService.addUserToOrg({
      // @ts-ignore-next-line
      orgId: req.user.id,
      userEmail,
    });
  }
}
