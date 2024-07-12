import { IsString } from 'class-validator';

export class DepositDTO {
  @IsString()
  txHash: string;
}
