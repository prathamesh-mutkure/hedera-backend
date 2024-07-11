import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  findByUser({ userId }: { userId: number }) {
    return this.prisma.payment.findMany({
      where: {
        userId,
      },
    });
  }

  findByPayrollInstance({ payrollInstanceId }: { payrollInstanceId: number }) {
    return this.prisma.payment.findMany({
      where: {
        payrollInstanceId,
      },
    });
  }
}
