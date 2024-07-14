import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(+id);
  }

  @Get('user/list')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  findByUser(@Req() req: Request) {
    // @ts-ignore-next-line
    const userId = req.user.id;
    return this.paymentService.findByUser({ userId });
  }

  @Get('payroll-instance/:payrollInstanceId')
  findByPayrollInstance(
    @Param('payrollInstanceId', ParseIntPipe) payrollInstanceId: number,
  ) {
    return this.paymentService.findByPayrollInstance({ payrollInstanceId });
  }
}
