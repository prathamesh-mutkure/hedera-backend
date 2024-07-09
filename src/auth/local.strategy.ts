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

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<User | Organization> {
    const { data, publicKey, signature, walletAddress, type } = req.body;

    const isValidSignature = await this.authService.validateSignature({
      data,
      publicKey,
      signature,
      walletAddress,
    });

    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    if (!type) {
      throw new BadRequestException(
        'Please provide user type, either user or organisation',
      );
    }

    if (type === 'USER') {
      const user = await this.authService.getOrCreateUser(
        walletAddress,
        publicKey,
      );

      if (!user) {
        throw new UnauthorizedException(
          'Failed to find or create user, please try again.',
        );
      }

      return user;
    } else if (type === 'ORGANIZATION') {
      const org = await this.authService.getOrCreateOrg(
        walletAddress,
        publicKey,
      );

      if (!org) {
        throw new UnauthorizedException(
          'Failed to find or create organization, please try again.',
        );
      }

      return org;
    }

    throw new BadRequestException('Invalid user type');
  }
}
