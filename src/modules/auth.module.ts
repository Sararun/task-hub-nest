import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth/auth.service';
import { AuthController } from '../http/controllers/auth.controller';
import { jwtConstants } from '../services/auth/constants';
import { PrismaService } from '../services/prisma.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '600s' },
    }),
  ],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {
}
