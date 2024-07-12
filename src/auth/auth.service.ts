import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { base64ToUint8Array } from 'src/lib/utils';
import { OrganizationService } from 'src/organization/organization.service';
import { AuthUser } from './entities/auth-user';
import { AuthOrganization } from './entities/auth-org';
import { CreateUserDTO } from 'src/user/dto/create-user-dto.dto';
import { CreateOrgDTO } from 'src/organization/dto/create-org.dto';

class VerifyDTO {
  stellarAccoundId: string;
  signature: string;
  data: string;
  walletAddress: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private orgService: OrganizationService,
    private jwtService: JwtService,
  ) {}

  async validateSignature({
    data,
    stellarAccoundId,
    signature,
    walletAddress,
  }: VerifyDTO): Promise<boolean> {
    const publicJWK = {
      e: 'AQAB',
      ext: true,
      kty: 'RSA',
      n: stellarAccoundId,
    };

    const hash = await crypto.subtle.digest(
      'SHA-256',
      base64ToUint8Array(data),
    );

    // import public jwk for verification
    const verificationKey = await crypto.subtle.importKey(
      'jwk',
      publicJWK,
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    );

    // verify the signature by matching it with the hash
    const isValidSignature = await crypto.subtle.verify(
      { name: 'RSA-PSS', saltLength: 32 },
      verificationKey,
      base64ToUint8Array(signature),
      hash,
    );

    const decoded = new TextDecoder().decode(base64ToUint8Array(data));

    return isValidSignature && decoded === walletAddress;
  }

  async getUser(stellarAccountId: string): Promise<AuthUser> {
    const user = await this.usersService.findByStellarId(stellarAccountId);

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    return { ...user, type: 'USER' };
  }

  async createUser({
    email,
    name,
    stellarAccountId,
    avatar,
  }: CreateUserDTO): Promise<AuthUser> {
    const user = await this.usersService.findByStellarId(stellarAccountId);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.usersService.create({
      stellarAccountId,
      email,
      name,
      avatar,
    });

    return { ...newUser, type: 'USER' };
  }

  async getOrg({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<AuthOrganization> {
    const org = await this.orgService.findByEmailAndPassword({
      email,
      password,
    });

    if (!org) {
      throw new BadRequestException('Org does not exist');
    }

    return { ...org, type: 'ORGANIZATION' };
  }

  async createOrg({
    email,
    password,
    name,
    avatar,
    website,
  }: CreateOrgDTO): Promise<AuthOrganization> {
    const org = await this.orgService.findByEmail(email);

    if (org) {
      throw new BadRequestException('Org already exists, sign in instead');
    }

    const newOrg = await this.orgService.create({
      email,
      password,
      name,
      avatar,
      website,
    });

    return { ...newOrg, type: 'ORGANIZATION' };
  }

  async login(
    entity: AuthUser | AuthOrganization,
  ): Promise<{ access_token: string }> {
    console.log('auth.service/login');

    const payload = { id: entity.id, type: entity.type };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
