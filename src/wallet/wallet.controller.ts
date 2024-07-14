import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DepositDTO } from './dto/deposit.dto';
import { Request } from 'express';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/deposit')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async deposit(@Body() { txHash }: DepositDTO, @Req() req: Request) {
    return this.walletService.deposit({
      // @ts-ignore-next-line
      orgId: req.user.id,
      txHash,
    });
  }

  @Get('/deposit')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getOrgDeposits(@Req() req: Request) {
    return this.walletService.getOrgDeposits({
      // @ts-ignore-next-line
      orgId: req.user.id,
    });
  }

  @Get('/balance')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getOrgBalance(@Req() req: Request) {
    return this.walletService.getOrgBalance({
      // @ts-ignore-next-line
      orgId: req.user.id,
    });
  }
}
