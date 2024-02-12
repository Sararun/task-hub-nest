import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  providers: [PrismaService, UserService],
  exports: [UserService],
})
export class UserModule {}
