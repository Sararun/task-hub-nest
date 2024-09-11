import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user.service';
import { PrismaService } from './services/prisma.service';
import { AuthController } from './http/controllers/auth.controller';
import { AuthModule } from './modules/auth.module';
import { AuthService } from './services/auth/auth.service';
import { ProfileController } from './http/controllers/profile.controller';
import { TaskController } from './http/controllers/task.controller';
import { BoardController } from './http/controllers/board.controller';
import { ColumnController } from './http/controllers/column.controller';
import { StatusController } from './http/controllers/status.controller';
import { CommentController } from './http/controllers/comment.controller';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './services/minio.service';
import { UserController } from './http/controllers/user.controller';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    ProfileController,
    BoardController,
    ColumnController,
    TaskController,
    StatusController,
    CommentController,
    UserController,
  ],
  providers: [
    AppService,
    UserService,
    PrismaService,
    AuthService,
    MinioService,
  ],
})
export class AppModule {}
