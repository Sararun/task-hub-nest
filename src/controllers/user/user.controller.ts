import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { Prisma, User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() userData: Prisma.UserCreateInput): Promise<User> {
    return this.userService.createUser(userData);
  }
  @Get('users')
  async getUsers() {
    console.log('/123');
    try {
      return await this.userService.allUsers();
    } catch (error) {
      console.error(error);
      throw new HttpException('Не удалось получить пользователей', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
