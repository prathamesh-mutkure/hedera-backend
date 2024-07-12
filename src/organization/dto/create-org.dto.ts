import { IsEmail, IsString } from 'class-validator';

export class CreateOrgDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  avatar: string | null;
  website: string | null;
}
