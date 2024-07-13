import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PayrollModule } from './payroll/payroll.module';
import { PaymentModule } from './payment/payment.module';
import { StellarModule } from './stellar/stellar.module';
import { WalletModule } from './wallet/wallet.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    UserModule,
    AuthModule,
    PayrollModule,
    PaymentModule,
    StellarModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
