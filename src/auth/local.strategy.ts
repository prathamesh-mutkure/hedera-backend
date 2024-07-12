import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { Organization, User } from '@prisma/client';
import { UserType } from './entities/user-type';
import {
  OrgSignInDTO,
  OrgSignUpDTO,
  UserSignInDTO,
  UserSignUpDTO,
} from './dto/auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'x',
      passwordField: 'y',
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<User | Organization> {
    console.log('local.strategy/validate');

    console.log('ss');

    type Body = UserSignUpDTO | UserSignInDTO | OrgSignUpDTO | OrgSignInDTO;
    const body: Body = req.body;

    const { authType } = body;

    // TODO: Signature validation for user

    if (!body.authType) {
      throw new BadRequestException(
        'Please provide user type, either user or organisation',
      );
    }

    if (authType === 'USER_SIGNUP') {
      const user = await this.authService.createUser({
        stellarAccountId: body.stellarAccountId,
        email: body.email,
        name: body.name,
        avatar: body.avatar,
      });

      return user;
    } else if (authType === 'USER_SIGNIN') {
      const user = await this.authService.getUser(body.stellarAccountId);

      return user;
    } else if (authType === 'ORG_SIGNUP') {
      const org = await this.authService.createOrg({
        email: body.email,
        password: body.password,
        name: body.name,
        avatar: body.avatar,
        website: body.website,
      });

      return org;
    } else if (authType === 'ORG_SIGNIN') {
      const org = await this.authService.getOrg({
        email: body.email,
        password: body.password,
      });

      return org;
    }

    throw new BadRequestException('Invalid AuthType type');
  }
}

// const isValidSignature = await this.authService.validateSignature({
//   data,
//   publicKey,
//   signature,
//   walletAddress,
// });

// if (!isValidSignature) {
//   throw new UnauthorizedException('Invalid signature');
// }
