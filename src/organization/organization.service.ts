import { Injectable } from '@nestjs/common';
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
      },
    });

    return newOrg;
  }

  async findById(id: number): Promise<Organization | null> {
    const org = await this.prisma.organization.findUnique({
      where: {
        id,
      },
    });

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

    return org;
  }
}
