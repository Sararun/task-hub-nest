import { Module } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ProfileController } from '../http/controllers/profile.controller';

@Module({
  providers: [PrismaService, ProfileController],
  controllers: [ProfileController],
})
export class ProfileModule {}
