import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../services/prisma.service';
import { AddTaskDtoRequest } from '../requests/addTask.dto.request';
import { Prisma, User } from '@prisma/client';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('tasks')
@ApiTags('tasks')
@UseGuards(AuthGuard('jwt'))
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  },
  description: 'User not authorized',
})
export class TaskController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        message: 'Task was been successfully created',
        statusCode: HttpStatus.CREATED,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: [
          'name should not be empty',
          'name must be shorter than or equal to 255 characters',
          'name must be a string',
        ],
        error: 'Bad request',
        statusCode: 400,
      },
    },
    description: 'Validation error',
  })
  @Post()
  async add(
    @Body() addTaskDto: AddTaskDtoRequest,
    @Req() request: any,
  ): Promise<{
    message: string;
    statusCode: HttpStatus;
  }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });
    if (!user) {
      throw UnauthorizedException;
    }
    await this.prisma.task.create({
      data: {
        name: addTaskDto.name,
        description: addTaskDto.description,
        deadline: addTaskDto.deadline,
        owner_id: user.id,
      },
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Task was been successfully created',
    };
  }

  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: "You tried deleting something that isn't there",
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
    description: 'Task not found',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        message: 'Task was been deleted successfully',
        statusCode: HttpStatus.OK,
      },
    },
    description: 'Task was been deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    schema: {
      example: {
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    },
    description: 'Internal server error.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Id of the task to be deleted',
    example: 1,
  })
  @Delete(':id')
  async delete(
    @Param('id') taskId: number,
    @Req() request: any,
  ): Promise<{ message: string; statusCode: HttpStatus }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });

    if (!user) {
      throw UnauthorizedException;
    }

    try {
      await this.prisma.task.delete({
        where: {
          owner_id: user.id,
          id: taskId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return {
          message: "You tried deleting something that isn't there",
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      throw InternalServerErrorException;
    }

    return {
      message: 'Task was been deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
