import { IsInt, IsNumber, IsString } from 'class-validator';

export class AddUserToPayrollDTO {
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
