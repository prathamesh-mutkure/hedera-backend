import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';

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
  async addUserToOrg(
    @Body() { userEmail, orgId }: { userEmail: string; orgId: number },
  ) {
    return this.organizationService.addUserToOrg({
      orgId,
      userEmail,
    });
  }
}
