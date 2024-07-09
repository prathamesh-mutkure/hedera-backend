import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';

import { PrismaService } from 'src/prisma.service';
import { OrganizationController } from './organization.controller';

@Module({
  providers: [OrganizationService, PrismaService],
  exports: [OrganizationService],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
