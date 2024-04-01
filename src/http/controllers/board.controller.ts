import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AddBoardDtoRequest } from '../requests/addBoard.dto.request';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Board } from '@prisma/client';
import { ValidateBoardExistsValidator } from '../../validators/validateBoardExists.validator';

@Controller('boards')
@ApiTags('boards')
@UseGuards(AuthGuard('jwt'))
export class BoardController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        payload: {
          id: 7,
          name: 'third',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        message: [
          'name must be shorter than or equal to 255 characters',
          'name must be a string',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @Post()
  async create(
    @Body() addBoardDto: AddBoardDtoRequest,
  ): Promise<{ payload: Board }> {
    const board: Board = await this.prisma.board.create({
      data: {
        name: addBoardDto.name,
      },
    });

    return {
      payload: board,
    };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            id: 1,
            name: 'first',
          },
          {
            id: 2,
            name: 'second',
          },
        ],
      },
    },
  })
  @Get()
  async get(): Promise<{ payload: Board[] | [] }> {
    const boards: Board[] | [] = await this.prisma.board.findMany();
    return { payload: boards };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: null,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: 'Board not found',
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  //TODO::сделать каскадное удаление для некоторых таблиц
  @Delete(':boardId')
  async delete(
    @Param('boardId', ParseIntPipe, ValidateBoardExistsValidator)
    boardId: number,
  ): Promise<{ payload: null }> {
    await this.prisma.board.delete({ where: { id: boardId } });

    return {
      payload: null,
    };
  }
}
