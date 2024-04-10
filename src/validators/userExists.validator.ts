import { Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { User } from '@prisma/client';
import { UserNotFoundException } from '../exceptions/http/users/user.not_found.exception';

@Injectable()
export class UserExistsValidator implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(userId: number) {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    return userId;
  }
}
