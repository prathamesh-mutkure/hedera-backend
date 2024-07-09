import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    publicKey,
    walletAddress,
  }: Prisma.UserCreateInput): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        walletAddress,
        publicKey,
        Profile: {
          create: {},
        },
      },
    });

    return newUser;
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async findByIdForReq(
    id: number,
  ): Promise<Pick<User, 'id' | 'email' | 'walletAddress'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        walletAddress: true,
      },
    });

    return user;
  }

  async findByAddress(walletAddress: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        walletAddress,
      },
    });

    return user;
  }
}
