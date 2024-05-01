import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth/auth.service';
import { AuthController } from '../http/controllers/auth.controller';
import { jwtConstants } from '../services/auth/constants';
import { PrismaService } from '../services/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { MinioService } from '../services/minio.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30m' },
    }),
    JwtModule,
  ],
  providers: [AuthService, PrismaService, JwtStrategy, MinioService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
