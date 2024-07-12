import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserProfileDTO } from './dto/update-profile.dto';
import { AuthUser } from 'src/auth/entities/auth-user';
import { CreateUserDTO } from './dto/create-user-dto.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    email,
    stellarAccountId,
    name,
    avatar,
  }: CreateUserDTO): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        email,
        stellarAccountId,
        Profile: {
          create: {
            name,
            avatar,
          },
        },
      },
    });

    return newUser;
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        stellarAccountId: true,
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
  ): Promise<Pick<
    AuthUser,
    'id' | 'email' | 'stellarAccountId' | 'type'
  > | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        stellarAccountId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...user, type: 'USER' };
  }

  async findByStellarId(stellarAccountId: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        stellarAccountId,
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        Profile: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user?.password;

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
