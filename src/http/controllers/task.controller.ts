import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../services/prisma.service';
import { AddTaskDtoRequest } from '../requests/addTask.dto.request';
import { Board, Column, Prisma, User } from '@prisma/client';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('boards/:boardId/columns/:columnId/tasks/')
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
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  schema: {
    example: {
      message: 'The board you wanted to add a column to does not exist',
      statusCode: HttpStatus.NOT_FOUND,
    },
  },
  description: 'Task not found',
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
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() addTaskDto: AddTaskDtoRequest,
    @Req() request: any,
  ): Promise<{
    message: string;
    statusCode: HttpStatus;
  }> {
    const board: Board | null = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });
    if (board == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The board you wanted to add a column to does not exist',
      };
    }

    const column: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
        board_id: boardId,
      },
    });

    if (column == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The column what you wanted doesn't exist",
      };
    }
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
        column_id: columnId,
        timestamps: new Date(),
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
  @Delete(':taskId')
  async delete(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('taskId') taskId: number,
    @Req() request: any,
  ): Promise<{ message: string; statusCode: HttpStatus }> {
    const board: Board | null = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });
    if (board == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The board what you wanted doesn't exist",
      };
    }

    const column: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
        board_id: boardId,
      },
    });

    if (column == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The column what you wanted doesn't exist",
      };
    }
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
          column_id: columnId,
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

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            id: 1,
            images: null,
            name: 'task_name',
            description: null,
            deadline: '2024-02-28T20:21:21.168Z',
            owner_id: 1,
            column_id: 4,
            timestamps: '2024-02-26T14:41:42.307Z',
          },
          {
            id: 2,
            images: null,
            name: 'task_name',
            description: null,
            deadline: '2024-02-28T20:21:21.168Z',
            owner_id: 1,
            column_id: 4,
            timestamps: '2024-02-26T14:41:47.734Z',
          },
        ],
        statusCode: HttpStatus.OK,
      },
    },
    description: 'Internal server error.',
  })
  async get(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('taskId') taskId: number,
    @Req() request: any,
  ) {
    const board: Board | null = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });
    if (board == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The board what you wanted doesn't exist",
      };
    }

    const column: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
        board_id: boardId,
      },
    });

    if (column == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The column what you wanted doesn't exist",
      };
    }
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });
    if (!user) {
      throw UnauthorizedException;
    }
    const payload = await this.prisma.task.findMany({
      where: {
        column_id: columnId,
      },
    });

    return { statusCode: HttpStatus.OK, payload: payload };
  }
}
