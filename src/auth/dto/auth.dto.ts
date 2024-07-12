import { IsString } from 'class-validator';

export type AuthType =
  | 'USER_SIGNUP'
  | 'USER_SIGNIN'
  | 'ORG_SIGNUP'
  | 'ORG_SIGNIN';

export class UserSignUpDTO {
  @IsString({})
  authType: 'USER_SIGNUP';
  stellarAccountId: string;
  email: string;
  name: string;
  avatar: string | null;

  // Passport Requirement
  x: string;
  y: string;
}

export class UserSignInDTO {
  authType: 'USER_SIGNIN';
  stellarAccountId: string;

  // Passport Requirement
  x: string;
  y: string;
}

export class OrgSignUpDTO {
  authType: 'ORG_SIGNUP';
  email: string;
  password: string;
  name: string;
  avatar: string | null;
  website: string | null;

  // Passport Requirement
  x: string;
  y: string;
}

export class OrgSignInDTO {
  authType: 'ORG_SIGNIN';
  email: string;
  password: string;

  // Passport Requirement
  x: string;
  y: string;
}
