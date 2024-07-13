import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePayrollDTO } from './dto/create-payroll.dto';
import { AddUserToPayrollDTO } from './dto/add-user-to-payroll.dto';

@Controller('payroll')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Request() req: Request, @Body() body: CreatePayrollDTO) {
    // @ts-ignore-next-line
    const orgId: number = req.user.id;

    return this.payrollService.create({
      name: body.name,
      organizationId: orgId,
      paymentType: body.paymentType,
      paymentDate: body.paymentDate,
      users: body.users,
    });
  }

  @Post(':payrollId/add/user')
  addUserToPayroll(
    @Request() req: Request,
    @Param('payrollId', ParseIntPipe) payrollId: number,
    @Body() body: AddUserToPayrollDTO,
  ) {
    // @ts-ignore-next-line
    const orgId: number = req.user.id;

    return this.payrollService.addUserToPayroll({
      payrollId,
      orgId,
      user: {
        id: body.id,
        amount: body.amount,
        token: body.token,
      },
    });
  }

  @Get(':payrollId/instance/new')
  createPayrollInstance(
    @Request() req: Request,
    @Param('payrollId', ParseIntPipe) payrollId: number,
  ) {
    // @ts-ignore-next-line
    const orgId: number = req.user.id;

    return this.payrollService.createPayrollInstance({
      payrollId,
      orgId,
    });
  }

  @Get('/instance/:payrollInstanceId/payments/generate')
  generatePaymentsForInstance(
    @Request() req: Request,
    @Param('payrollInstanceId', ParseIntPipe) payrollInstanceId: number,
  ) {
    // @ts-ignore-next-line
    const orgId: number = req.user.id;

    return this.payrollService.generatePaymentsForInstance({
      payrollInstanceId,
      orgId,
    });
  }

  @Get('/instance/:payrollInstanceId/payments/trigger')
  triggerPaymentsForInstance(
    @Request() req: Request,
    @Param('payrollInstanceId', ParseIntPipe) payrollInstanceId: number,
  ) {
    // @ts-ignore-next-line
    // const orgId: number = req.user.id;

    return this.payrollService.triggerPaymentsForInstance({
      payrollInstanceId,
    });
  }

  @Get('/:payrollId')
  findOne(@Param('payrollId', ParseIntPipe) payrollId: number) {
    return this.payrollService.findOne(payrollId);
  }

  @Get('/org/list')
  findByOrg() {
    // @ts-ignore-next-line
    const orgId: number = req.user.id;
    return this.payrollService.findByOrg({ orgId });
  }

  @Get('test/test')
  test() {
    // return this.payrollService.checkAndCreateRecurringPayrollInstances();
    // return this.payrollService.triggerPaymentsForInstance({
    //   payrollInstanceId: 1,
    // });

    return 'Test';
  }
}
