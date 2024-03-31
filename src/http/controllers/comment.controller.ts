import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDtoRequest } from '../requests/comments/createComment.dto.request';
import { PrismaService } from '../../services/prisma.service';
import { ValidateTaskExistsValidator } from '../../validators/validateTaskExists.validator';
import { ValidateCommentExistValidator } from '../../validators/validateCommentExist.validator';
import { UpdateCommentDtoRequest } from '../requests/comments/updateComment.dto.request';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  schema: {
    example: {
      message: "The task what you wanted doesn't exist",
      error: 'Not Found',
      statusCode: 404,
    },
  },
})
@Controller('tasks/:taskId/comments/')
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: ['content must be a string'],
        error: 'Bad request',
        statusCode: 400,
      },
    },
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        payload: {
          id: 12,
          content: 'aaaaaaaac',
          taskId: 2,
          userId: 1,
          answerId: 1,
          type: true,
        },
      },
    },
  })
  @Post()
  async create(
    @Body() createColumnDto: CreateCommentDtoRequest,
    @Param('taskId', ParseIntPipe, ValidateTaskExistsValidator) taskId: number,
    @Req() request: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });

    if (user) {
      const comment = await this.prisma.comment.create({
        data: {
          content: createColumnDto.content,
          userId: user.id,
          answerId: createColumnDto?.answerId,
          taskId: taskId,
          type: createColumnDto?.type,
        },
      });

      return {
        payload: comment,
      };
    }
    throw UnauthorizedException;
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: null,
      },
    },
  })
  @Delete(':commentId')
  async delete(
    @Param('taskId', ParseIntPipe, ValidateTaskExistsValidator) taskId: number,
    @Param('commentId', ParseIntPipe, ValidateCommentExistValidator)
    commentId: number,
  ): Promise<{ payload: null }> {
    await this.prisma.comment.delete({
      where: {
        id: commentId,
        taskId: taskId,
      },
    });

    return {
      payload: null,
    };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: {
          id: 12,
          content: 'aaaaaaaac',
          taskId: 2,
          userId: 1,
          answerId: 1,
          type: true,
        },
      },
    },
  })
  @Patch(':commentId')
  async update(
    @Param('taskId', ParseIntPipe, ValidateTaskExistsValidator) taskId: number,
    @Param('commentId', ParseIntPipe, ValidateCommentExistValidator)
    commentId: number,
    @Body() updateCommentDto: UpdateCommentDtoRequest,
  ) {
    const comment = await this.prisma.comment.update({
      where: {
        id: commentId,
        taskId: taskId,
      },
      data: {
        content: updateCommentDto.content,
      },
    });
    return {
      payload: comment,
    };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            id: 1,
            content: '0000000000000000',
            taskId: 2,
            userId: 1,
            answerId: null,
            type: null,
          },
          {
            id: 2,
            content: '111111111111',
            taskId: 2,
            userId: 1,
            answerId: null,
            type: null,
          },
        ],
      },
    },
  })
  @Get()
  async get(
    @Param('taskId', ParseIntPipe, ValidateTaskExistsValidator) taskId: number,
  ) {
    const comments = await this.prisma.comment.findMany({
      where: { taskId: taskId },
    });
    return { payload: comments };
  }
}
