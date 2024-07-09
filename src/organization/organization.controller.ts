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

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findById(id);
  }

  @Get(':id/detailed')
  async getByIdDetailed(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findByIdDetailed(id);
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
