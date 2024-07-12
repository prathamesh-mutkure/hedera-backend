import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from 'src/prisma.service';
import { StellarService } from 'src/stellar/stellar.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService, StellarService],
})
export class WalletModule {}
