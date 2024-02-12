import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user.service';
import { PrismaService } from './services/prisma.service';
import { AuthController } from './http/controllers/auth.controller';
import { AuthModule } from './modules/auth.module';
import { AuthService } from './services/auth/auth.service';
import { UserModule } from './modules/user.module';
import { ProfileController } from './http/controllers/profile.controller';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AppController, AuthController, ProfileController],
  providers: [AppService, UserService, PrismaService, AuthService],
})
export class AppModule {}
