import { IsEmail, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsString()
  stellarAccountId: string;

  @IsString()
  name: string;

  avatar: string | null;
}
