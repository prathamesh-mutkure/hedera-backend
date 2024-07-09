import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Organization } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    publicKey,
    walletAddress,
  }: Prisma.OrganizationCreateInput): Promise<Organization> {
    const newOrg = await this.prisma.organization.create({
      data: {
        walletAddress,
        publicKey,
        OrgProfile: {
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
        walletAddress: true,
        orgContractId: true,
        createdAt: true,
        updatedAt: true,
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
      },
    });

    delete org?.password;

    return org;
  }

  async findByIdForReq(id: number): Promise<
    | (Pick<Organization, 'id' | 'email' | 'walletAddress'> & {
        type: 'ORGANIZATION';
      })
    | null
  > {
    const org = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        walletAddress: true,
      },
    });

    return { ...org, type: 'ORGANIZATION' };
  }

  async findByAddress(
    walletAddress: string,
  ): Promise<Organization | undefined> {
    const org = await this.prisma.organization.findUnique({
      where: {
        walletAddress,
      },
    });

    delete org?.password;

    return org;
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
