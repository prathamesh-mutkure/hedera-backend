import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateOrgProfileDTO } from './dto/update-profile.dto';
import { AuthOrganization } from 'src/auth/entities/auth-org';
import { CreateOrgDTO } from './dto/create-org.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    email,
    password,
    name,
    avatar,
    website,
  }: CreateOrgDTO): Promise<Organization> {
    const newOrg = await this.prisma.organization.create({
      data: {
        email,
        password,
        OrgProfile: {
          create: {
            name,
            avatar,
            website,
          },
        },
        Balance: {
          create: {},
        },
      },
    });

    return newOrg;
  }

  async findById(
    id: number,
  ): Promise<Omit<Organization, 'password' | 'publicKey'> | null> {
    const org = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        stellarAccountId: true,
        orgContractId: true,
        createdAt: true,
        updatedAt: true,
        OrgProfile: {
          select: {
            name: true,
            avatar: true,
            website: true,
          },
        },
        Balance: {
          select: {
            id: true,
          },
        },
      },
    });

    return org;
  }

  async findByEmail(
    email: string,
  ): Promise<Omit<Organization, 'password'> | null> {
    const org = await this.prisma.organization.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        stellarAccountId: true,
        orgContractId: true,
        createdAt: true,
        updatedAt: true,
        OrgProfile: {
          select: {
            name: true,
            avatar: true,
            website: true,
          },
        },
        Balance: {
          select: {
            id: true,
          },
        },
      },
    });

    return org;
  }

  async findByIdDetailed(id: number) {
    const org = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        Users: {
          select: {
            userId: true,
          },
        },
        OrgProfile: true,
        Balance: true,
      },
    });

    delete org?.password;

    return org;
  }

  async findByIdForReq(
    id: number,
  ): Promise<Pick<
    AuthOrganization,
    'id' | 'email' | 'stellarAccountId' | 'type'
  > | null> {
    const org = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        stellarAccountId: true,
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return { ...org, type: 'ORGANIZATION' };
  }

  async findByStellarAccountId(
    stellarAccountId: string,
  ): Promise<Organization | undefined> {
    const org = await this.prisma.organization.findUnique({
      where: {
        stellarAccountId,
      },
    });

    delete org?.password;

    return org;
  }

  async findByEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Organization | undefined> {
    const org = await this.prisma.organization.findUnique({
      where: {
        email,
        password,
      },
    });

    if (!org) {
      throw new BadRequestException('Invalid username or password');
    }

    delete org?.password;

    return org;
  }

  async getOrgUsers({ orgId }: { orgId: number }) {
    const userOrgs = await this.prisma.userOrganisations.findMany({
      where: {
        orgId,
      },
      select: {
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            Profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return userOrgs;
  }

  async updateProfile({
    orgId,
    data,
  }: {
    orgId: number;
    data: UpdateOrgProfileDTO;
  }) {
    const orgProfile = await this.prisma.orgProfile.update({
      where: {
        orgId,
      },
      data: {
        ...data,
      },
    });

    return orgProfile;
  }

  async addUserToOrg({
    userEmail,
    orgId,
  }: {
    userEmail: string;
    orgId: number;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orgUserExists = await this.prisma.userOrganisations.findUnique({
      where: {
        orgId,
        userId: user.id,
      },
    });

    if (orgUserExists) {
      throw new BadRequestException(
        `User with email ${userEmail} is already part of the organization`,
      );
    }

    const orgUser = await this.prisma.userOrganisations.create({
      data: {
        orgId,
        userId: user.id,
      },
    });

    if (!orgUser) {
      throw new InternalServerErrorException(
        'Failed to add user to organization',
      );
    }

    return orgUser;
  }
}
