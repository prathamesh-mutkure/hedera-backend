import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PayrollPaymentType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    name,
    organizationId,
    paymentType,
    recurringDates,
    users,
  }: {
    name: string;
    organizationId: number;
    paymentType: PayrollPaymentType;
    recurringDates: Date[];
    users: {
      id: number;
      amount: number;
      token: string;
    }[];
  }) {
    // Checks if the users exists in the organization
    const orgUsers = await this.prisma.userOrganisations.findMany({
      where: {
        orgId: organizationId,
      },
      select: {
        id: true,
        userId: true,
        orgId: true,
      },
    });

    const orgUserIds = orgUsers.map((orgUser) => orgUser.userId);

    users.map((user) => {
      if (!orgUserIds.includes(user.id)) {
        throw new BadRequestException(
          `User with id ${user.id} is not part of the organization`,
        );
      }
    });

    orgUsers.map((orgUser) => {
      if (!users.find((user) => user.id === orgUser.userId)) {
        throw new Error(
          `User with id ${orgUser.userId} is not part of the organization`,
        );
      }
    });

    // Create the payroll
    const payroll = this.prisma.payroll.create({
      data: {
        name,
        organizationId,
        paymentType,
        recurringDates,
        PayrollEntry: {
          createMany: {
            data: users.map((user) => ({
              userId: user.id,
              amount: user.amount,
              token: user.token,
            })),
          },
        },
      },
    });

    return payroll;
  }

  async addUserToPayroll({
    payrollId,
    orgId,
    user,
  }: {
    payrollId: number;
    orgId: number;
    user: {
      id: number;
      amount: number;
      token: string;
    };
  }) {
    // Checks if the payroll belongs to the organization
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        id: payrollId,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!payroll) {
      throw new NotFoundException(
        `Payroll with id ${payrollId} does not exist`,
      );
    }

    if (payroll.organizationId !== orgId) {
      throw new UnauthorizedException(
        `This payroll does not belong to the organization with id ${orgId}`,
      );
    }

    // Checks if the user exists in the organization
    const orgUser = await this.prisma.userOrganisations.findUnique({
      where: {
        orgId,
        userId: user.id,
      },
      select: {
        id: true,
        userId: true,
        orgId: true,
      },
    });

    if (!orgUser) {
      throw new BadRequestException(
        `User with id ${user.id} is not part of the organization`,
      );
    }

    const payrollEntry = await this.prisma.payrollEntry.create({
      data: {
        Payroll: {
          connect: { id: payrollId },
        },
        User: {
          connect: { id: user.id },
        },
        amount: user.amount,
        token: user.token,
      },
    });

    return payrollEntry;
  }

  async createPayrollInstance({ payrollId }: { payrollId: number }) {
    const payrollInstance = await this.prisma.payrollInstance.create({
      data: {
        Payroll: {
          connect: { id: payrollId },
        },
        date: new Date(),
      },
    });

    return payrollInstance;
  }

  async generatePaymentsForInstance({
    payrollInstanceId,
  }: {
    payrollInstanceId: number;
  }) {
    const payrollInstance = await this.prisma.payrollInstance.findUnique({
      where: { id: payrollInstanceId },
      include: {
        Payroll: {
          include: {
            PayrollEntry: {
              include: {
                User: true,
              },
            },
          },
        },
      },
    });

    if (!payrollInstance) {
      throw new Error('Payroll instance not found');
    }

    const payments = payrollInstance.Payroll.PayrollEntry.map((entry) => ({
      payrollInstanceId: payrollInstance.id,
      userId: entry.userId,
      amount: entry.amount,
    }));

    await this.prisma.payment.createMany({
      data: payments,
    });
  }

  async triggerPaymentsForInstance({
    payrollInstanceId,
  }: {
    payrollInstanceId: number;
  }) {
    // Get all pening payments for the payroll instance
    const payments = await this.prisma.payment.findMany({
      where: {
        payrollInstanceId,
        status: 'PENDING',
      },
      include: {
        User: true,
      },
    });

    for (const payment of payments) {
      try {
        // Set payment to processing
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PROCESSING' },
        });

        // TODO: Implement payment logic here
        // Use Stellar JS SDK

        // TODO: Tx hash should be the actual transaction hash
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            txHash: 'txHash',
          },
        });

        console.log(`Paid ${payment.amount} to ${payment.User.email}`);
      } catch (error) {
        // If payment fails, mark it as failed
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        console.error(
          `Failed to pay ${payment.amount} to ${payment.User.email}: ${error.message}`,
        );
      }
    }

    // Update the payroll instance status
    const allPayments = await this.prisma.payment.findMany({
      where: { payrollInstanceId },
    });

    const allPaid = allPayments.every((payment) => payment.status === 'PAID');
    const allFailed = allPayments.every(
      (payment) => payment.status === 'FAILED',
    );

    await this.prisma.payrollInstance.update({
      where: { id: payrollInstanceId },
      data: {
        status: allPaid ? 'PAID' : allFailed ? 'FAILED' : 'PARTIALLY_PAID',
      },
    });
  }

  async checkAndCreateRecurringPayrollInstances() {
    const today = new Date();

    // TODO: Implement ONE_TIME payroll logic
    const recurringPayrolls = await this.prisma.payroll.findMany({
      where: {
        paymentType: 'RECURRING',
        recurringDates: {
          has: today,
        },
      },
    });

    for (const payroll of recurringPayrolls) {
      const instance = await this.createPayrollInstance({
        payrollId: payroll.id,
      });

      await this.generatePaymentsForInstance({
        payrollInstanceId: instance.id,
      });
      await this.triggerPaymentsForInstance({ payrollInstanceId: instance.id });
    }
  }

  findAll() {
    return `This action returns all payroll`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payroll`;
  }

  update(id: number) {
    return `This action updates a #${id} payroll`;
  }

  remove(id: number) {
    return `This action removes a #${id} payroll`;
  }
}
