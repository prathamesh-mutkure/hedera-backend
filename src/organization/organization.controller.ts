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
import { OrganizationService } from './organization.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddUserToOrgDTO } from './dto/add-user-to-org.dto';
import { UpdateOrgProfileDTO } from './dto/update-profile.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('/users')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getOrgUsers(@Request() req: Request) {
    // @ts-ignore
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
  async updateOrgProfile(@Body() body: UpdateOrgProfileDTO, @Request() req) {
    return this.organizationService.updateProfile({
      orgId: req.user.id,
      data: body,
    });
  }

  @Patch('/user')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async addUserToOrg(@Body() { userEmail }: AddUserToOrgDTO, @Request() req) {
    return this.organizationService.addUserToOrg({
      orgId: req.user.id,
      userEmail,
    });
  }
}
