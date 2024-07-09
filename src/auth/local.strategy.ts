import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<User> {
    const { data, publicKey, signature, walletAddress } = req.body;

    const isValidSignature = await this.authService.validateSignature({
      data,
      publicKey,
      signature,
      walletAddress,
    });

    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

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
  }
}
