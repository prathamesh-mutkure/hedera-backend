import { IsEmail } from 'class-validator';

export class AddUserToOrgDTO {
  /**
   * Pass the number of invitation codes to generate
   * @example: 1
   */
  @IsEmail({}, { message: 'userEmail must be a valid email' })
  userEmail: string;
}
