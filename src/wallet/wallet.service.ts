import { BadRequestException, Injectable } from '@nestjs/common';
import { StellarService } from 'src/stellar/stellar.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stellarService: StellarService,
  ) {}

  async getOrgDeposits({ orgId }: { orgId: number }) {
    const deposits = await this.prisma.deposit.findMany({
      where: {
        orgId,
      },
    });

    return deposits;
  }

  async deposit({ orgId, txHash }: { txHash: string; orgId: number }) {
    const org = await this.prisma.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        id: true,
        stellarAccountId: true,
        Balance: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    });

    const opData = await StellarService.getTxnOperations({
      txHash,
    });

    if (!opData.transaction_successful) {
      throw new BadRequestException('Transaction failed');
    }

    // TODO: Fix
    // if (opData.from !== org.stellarAccountId) {
    //   throw new BadRequestException('Transaction sent from wrong account');
    // }

    // if (opData.to !== this.stellarService.stellarAccountId) {
    //   throw new BadRequestException('Transaction sent to wrong account');
    // }

    if (opData.type !== 'payment') {
      throw new BadRequestException('Operation not of type payment');
    }

    const amount = parseFloat(opData.amount);

    const [deposit] = await this.prisma.$transaction([
      this.prisma.deposit.create({
        data: {
          amount,
          token: opData.asset_type === 'native' ? 'XLM' : opData.asset_type,
          txHash,
          Organization: {
            connect: { id: orgId },
          },
        },
      }),
      this.prisma.balance.update({
        where: {
          orgId,
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      }),
    ]);

    return deposit;
  }

  async getOrgBalance({ orgId }: { orgId: number }) {
    const balance = await this.prisma.balance.findUnique({
      where: {
        orgId,
      },
      select: {
        id: true,
        orgId: true,
        amount: true,
      },
    });

    return balance;
  }
}
