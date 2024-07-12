import { PayrollPaymentType } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePayrollDTO {
  /**
   * Pass the number of invitation codes to generate
   * @example: 1
   */
  @IsString({ message: 'name must be a valid string' })
  name: string;

  @IsEnum(PayrollPaymentType, {
    message: `paymentType must be a valid PayrollPaymentType - ${PayrollPaymentType.ONE_TIME} or ${PayrollPaymentType.RECURRING}`,
  })
  paymentType: PayrollPaymentType;

  @IsDate()
  paymentDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  users: CreatePayrollUserDTO[];
}

export class CreatePayrollUserDTO {
  @IsInt({ message: 'id must be a valid integer' })
  id: number;

  @IsNumber()
  amount: number;

  /**
   * Pass the type of token
   * @example: XLM or USDT
   */
  @IsString({ message: 'token must be a valid string' })
  token: string;
}
