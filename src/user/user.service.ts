import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserProfileDTO } from './dto/update-profile.dto';
import { AuthUser } from 'src/auth/entities/auth-user';

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

  async findById(
    id: number,
  ): Promise<Omit<User, 'password' | 'publicKey'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findByIdDetailed(id: number) {
    const org = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        Organizations: {
          select: {
            orgId: true,
          },
        },
        Profile: true,
      },
    });

    delete org?.password;

    return org;
  }

  async findByIdForReq(
    id: number,
  ): Promise<Pick<AuthUser, 'id' | 'email' | 'walletAddress' | 'type'> | null> {
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...user, type: 'USER' };
  }

  async findByAddress(walletAddress: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        walletAddress,
      },
    });

    return user;
  }

  async updateProfile({
    userId,
    data,
  }: {
    userId: number;
    data: UpdateUserProfileDTO;
  }) {
    const userProfile = await this.prisma.userProfile.update({
      where: {
        userId,
      },
      data: {
        ...data,
      },
    });

    return userProfile;
  }
}
