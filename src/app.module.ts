import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user.service';
import { PrismaService } from './services/prisma.service';
import { AuthController } from './http/controllers/auth.controller';
import { AuthModule } from './modules/auth.module';
import { AuthService } from './services/auth/auth.service';
import { ProfileController } from './http/controllers/profile.controller';
import { ProfileModule } from './modules/profile.module';
import { TaskController } from './http/controllers/task.controller';
import { BoardController } from './http/controllers/board.controller';
import { ColumnController } from './http/controllers/column.controller';
import { StatusController } from './http/controllers/status.controller';
import { CommentController } from './http/controllers/comment.controller';

@Module({
  imports: [AuthModule, ProfileModule],
  controllers: [
    AppController,
    AuthController,
    ProfileController,
    BoardController,
    ColumnController,
    TaskController,
    StatusController,
    CommentController,
  ],
  providers: [AppService, UserService, PrismaService, AuthService],
})
export class AppModule {}
