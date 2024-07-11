import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  create(@Request() req: Request) {
    // @ts-ignore-next-line
    // console.log(req.user);
    return this.payrollService.create();
  }

  @Get()
  findAll() {
    return this.payrollService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.payrollService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollService.remove(+id);
  }
}
