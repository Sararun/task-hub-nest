import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth/auth.service';
import { AuthController } from '../http/controllers/auth.controller';
import { jwtConstants } from '../services/auth/constants';
import { PrismaService } from '../services/prisma.service';
import { ProfileModule } from './profile.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '600s' },
    }),
    ProfileModule,
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
