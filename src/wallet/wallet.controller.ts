import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DepositDTO } from './dto/deposit.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/deposit')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async deposit(@Body() { txHash }: DepositDTO, @Request() req) {
    return this.walletService.deposit({
      orgId: req.user.id,
      txHash,
    });
  }

  @Get('/deposit')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getOrgDeposits(@Request() req) {
    return this.walletService.getOrgDeposits({
      orgId: req.user.id,
    });
  }

  @Get('/balance')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getOrgBalance(@Request() req) {
    return this.walletService.getOrgBalance({
      orgId: req.user.id,
    });
  }
}
