import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePayrollDTO } from './dto/create-payroll.dto';
import { StellarService } from 'src/stellar/stellar.service';
import { Payroll } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stellarService: StellarService,
  ) {}

  async create({
    name,
    organizationId,
    paymentType,
    paymentDate,
    users,
  }: CreatePayrollDTO & { organizationId: number }) {
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

    const date = new Date(paymentDate);
    const paymentDateOfTheMonth = date.getDate();

    // Create the payroll
    const payroll = this.prisma.payroll.create({
      data: {
        name,
        organizationId,
        paymentType,
        paymentDate,
        paymentDateOfTheMonth,
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

  async createPayrollInstance({
    payrollId,
    orgId,
  }: {
    payrollId: number;
    orgId: number;
  }) {
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
    orgId,
  }: {
    payrollInstanceId: number;
    orgId: number;
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
            Organization: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!payrollInstance) {
      throw new Error('Payroll instance not found');
    }

    if (payrollInstance.Payroll.Organization.id !== orgId) {
      throw new UnauthorizedException(
        `This payroll instance does not belong to the organization with id ${orgId}`,
      );
    }

    const paymentsData = payrollInstance.Payroll.PayrollEntry.map((entry) => ({
      payrollInstanceId: payrollInstance.id,
      userId: entry.userId,
      amount: entry.amount,
    }));

    const payments = await this.prisma.payment.createMany({
      data: paymentsData,
    });

    return payments;
  }

  async triggerPaymentsForInstance({
    payrollInstanceId,
  }: {
    payrollInstanceId: number;
  }) {
    // TODO: Admin or Org Check
    // TODO: Notifications

    try {
      // Get all pending payments for the payroll instance
      const pendingPayments = await this.prisma.payment.findMany({
        where: {
          payrollInstanceId,
          status: 'PENDING',
        },
        include: {
          User: true,
        },
      });

      // Make payments on-chain
      const paymentResult = await this.stellarService.transferMultipleFunds({
        accounts: pendingPayments.map((payment) => ({
          amount: payment.amount,
          destinationAccount: payment.User.stellarAccountId,
        })),
        memoText: `${payrollInstanceId}`,
      });

      const updatedPayments = await this.prisma.payment.updateMany({
        where: {
          payrollInstanceId,
          status: 'PENDING',
        },
        data: {
          status: paymentResult.successful ? 'PAID' : 'FAILED',
          paidAt: new Date(),
          txHash: paymentResult.hash,
        },
      });

      await this.prisma.payrollInstance.update({
        where: { id: payrollInstanceId },
        data: {
          status: paymentResult.successful ? 'PAID' : 'FAILED',
        },
      });

      return true;
    } catch (error) {
      console.log('Failed to make payments');

      await this.prisma.payrollInstance.update({
        where: { id: payrollInstanceId },
        data: {
          status: 'PROCESSING',
        },
      });

      return false;
    }
  }

  async processPayroll(payroll: Payroll) {
    const instance = await this.createPayrollInstance({
      payrollId: payroll.id,
      orgId: payroll.organizationId,
    });

    const payments = await this.generatePaymentsForInstance({
      payrollInstanceId: instance.id,
      orgId: payroll.organizationId,
    });

    const res = await this.triggerPaymentsForInstance({
      payrollInstanceId: instance.id,
    });

    return res;
  }

  async checkAndCreateRecurringPayrollInstances() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayDateOfTheMonth = new Date().getDate();

    const oneTimePayrolls = await this.prisma.payroll.findMany({
      where: {
        paymentType: 'ONE_TIME',
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        Organization: {
          select: {
            id: true,
          },
        },
      },
    });

    const recurringPayrolls = await this.prisma.payroll.findMany({
      where: {
        paymentType: 'RECURRING',
        state: 'ACTIVE',
        paymentDateOfTheMonth: todayDateOfTheMonth,
      },
      include: {
        Organization: {
          select: {
            id: true,
          },
        },
      },
    });

    const allPayrolls = [...oneTimePayrolls, ...recurringPayrolls];

    const allExecutionPromises = allPayrolls.map((payroll) =>
      this.processPayroll(payroll),
    );

    const results = await Promise.all(allExecutionPromises);

    console.log(results);

    return results;
  }

  async findOne(id: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: {
        id,
      },
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with id ${id} does not exist`);
    }

    return payroll;
  }

  async findByOrg({ orgId }: { orgId: number }) {
    return this.prisma.payroll.findMany({
      where: {
        organizationId: orgId,
      },
    });
  }
}
