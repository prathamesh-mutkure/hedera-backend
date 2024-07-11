import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(+id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.paymentService.findByUser({ userId });
  }

  @Get('payroll-instance/:payrollInstanceId')
  findByPayrollInstance(
    @Param('payrollInstanceId', ParseIntPipe) payrollInstanceId: number,
  ) {
    return this.paymentService.findByPayrollInstance({ payrollInstanceId });
  }
}
