import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_SECRET } from 'src/lib/constants';
import { UserService } from 'src/user/user.service';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UserService,
    private orgService: OrganizationService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AUTH_SECRET,
    });
  }

  async validate(payload: {
    id: number;
    iat: number;
    exp: number;
    type: 'USER' | 'ORGANIZATION';
  }) {
    const { type } = payload;

    if (type === 'USER') {
      const user = await this.usersService.findByIdForReq(+payload.id);

      if (!user) {
        throw new UnauthorizedException("The user doesn't exist");
      }

      return { ...user };
    } else if (type === 'ORGANIZATION') {
      const org = await this.orgService.findByIdForReq(+payload.id);

      if (!org) {
        throw new UnauthorizedException("The org doesn't exist");
      }

      return { ...org };
    }

    throw new BadRequestException('Invalid user type');
  }
}
