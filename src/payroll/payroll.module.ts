import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PrismaService } from 'src/prisma.service';
import { StellarService } from 'src/stellar/stellar.service';

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, PrismaService, StellarService],
})
export class PayrollModule {}
