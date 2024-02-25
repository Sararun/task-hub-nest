import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AddBoardDtoRequest } from '../requests/addBoard.dto.request';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('boards')
@ApiTags('boards')
export class BoardController {
  constructor(private readonly prisma: PrismaService) {}

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
        statusCode: HttpStatus.OK,
      },
    },
  })
  @Get()
  get() {
    const payload = this.prisma.board.findMany();
    return { statusCode: HttpStatus.OK, payload: payload };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        message: 'The board was been successfully created',
        statusCode: HttpStatus.OK,
      },
    },
  })
  @Post()
  async create(@Body() addBoardDto: AddBoardDtoRequest): Promise<{
    statusCode: HttpStatus.OK;
    message: 'The board was been successfully created';
  }> {
    await this.prisma.board.create({
      data: {
        name: addBoardDto.name,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'The board was been successfully created',
    };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        message: 'The board successfully deleted',
        statusCode: HttpStatus.OK,
      },
    },
  })
  @Delete(':boardId')
  async delete(@Param('boardId', ParseIntPipe) boardId: number): Promise<{
    statusCode: HttpStatus.OK;
    message: 'The board successfully deleted';
  }> {
    await this.prisma.board.delete({ where: { id: boardId } });
    return {
      statusCode: HttpStatus.OK,
      message: 'The board successfully deleted',
    };
  }
}
