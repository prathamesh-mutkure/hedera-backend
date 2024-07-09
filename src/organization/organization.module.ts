import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';

import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [OrganizationService, PrismaService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
