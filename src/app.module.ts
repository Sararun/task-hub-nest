import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user/user.service';
import { PrismaService } from './services/prisma/prisma.service';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './services/auth/auth.service';
import { UserModule } from './modules/user/user.module';
import { UserController } from './controllers/user/user.controller';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, UserService, PrismaService, AuthService],
})
export class AppModule {}
