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
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddColumnDtoRequest } from '../requests/addColumn.dto.request';
import { Board, Column } from '@prisma/client';
import { UpdateColumnDtoRequest } from '../requests/updateColumn.dto.request';
import { AuthGuard } from '@nestjs/passport';

@Controller('boards/:boardId/columns/')
@ApiTags('columns')
export class ColumnController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        message: 'Column was been successfully created',
        statusCode: HttpStatus.CREATED,
        payload: {
          id: 9,
          name: 'third',
          column_number: 6,
          board_id: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: ['name should not be empty'],
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createColumn(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() createColumnDto: AddColumnDtoRequest,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    payload: Column | null;
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
        payload: null,
      };
    }
    const columnWithMaxNumber: { _max: { column_number: number | null } } =
      await this.prisma.column.aggregate({
        where: {
          board_id: boardId,
        },
        _max: {
          column_number: true,
        },
      });

    let columnMaxNumber: number;
    if (columnWithMaxNumber._max.column_number === null) {
      columnMaxNumber = 0;
    } else {
      columnMaxNumber = columnWithMaxNumber._max.column_number + 1;
    }

    const column: Column = await this.prisma.column.create({
      data: {
        name: createColumnDto.name,
        column_number: columnMaxNumber,
        board_id: boardId,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Column was been successfully created',
      payload: column,
    };
  }

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
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        message: 'The column was been updated successfully',
        statusCode: HttpStatus.OK,
        payload: {
          id: 5,
          name: 'five',
          column_number: 0,
          board_id: 2,
        },
      },
    },
    description: 'The column was been updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: ['name must be a string'],
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: "The column what you want to update doesn't exist",
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  @Patch(':columnId')
  async updateColumns(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() updateColumnDto: UpdateColumnDtoRequest,
  ) {
    const board: Board | null = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });
    if (board == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The board you wanted to add a column to does not exist',
        payload: null,
      };
    }

    const updatableColumn: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
      },
    });

    if (updatableColumn == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The column what you want to update doesn't exist",
        payload: null,
      };
    }

    if (updateColumnDto.columnNumber != undefined) {
      const existColumnNumber: Column | null =
        await this.prisma.column.findFirst({
          where: {
            board_id: boardId,
            column_number: updateColumnDto.columnNumber,
            id: {
              not: updatableColumn.id,
            },
          },
        });
      if (existColumnNumber != null) {
        const columnForSwap: Column | null = await this.prisma.column.findFirst(
          {
            where: {
              board_id: boardId,
              column_number: updateColumnDto.columnNumber,
            },
          },
        );
        if (columnForSwap != null) {
          const result = await this.prisma.$transaction(async (prisma) => {
            await prisma.column.update({
              where: {
                id: columnForSwap.id,
                board_id: boardId,
                column_number: columnForSwap.column_number,
              },
              data: {
                column_number: 1000 + columnForSwap.column_number,
              },
            });
            const targetColumn = await prisma.column.update({
              where: { id: columnId },
              data: {
                column_number: updateColumnDto.columnNumber,
                name: updateColumnDto?.name,
              },
            });
            await prisma.column.update({
              where: {
                id: columnForSwap.id,
                board_id: boardId,
                column_number: columnForSwap.column_number + 1000,
              },
              data: {
                column_number: updatableColumn.column_number,
              },
            });
            return targetColumn;
          });

          return {
            statusCode: HttpStatus.OK,
            message: 'The column was been updated successfully',
            payload: result,
          };
        }
      }
    }
    const updatedColumn = await this.prisma.column.update({
      where: {
        id: columnId,
        board_id: boardId,
      },
      data: {
        name: updateColumnDto?.name,
        column_number: updateColumnDto?.columnNumber,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'The column was been updated successfully',
      payload: updatedColumn,
    };
  }

  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: "The column what you want to delete doesn't exist",
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    schema: {
      example: {
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        message: 'The column was been deleted successfully',
        statusCode: HttpStatus.OK,
      },
    },
  })
  @Delete(':columnId')
  async delete(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('columnId', ParseIntPipe) columnId: number,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
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

    const deletableColumn: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
        board_id: boardId,
      },
    });

    if (deletableColumn == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The column what you want to delete doesn't exist",
      };
    }

    const columnsToUpdate = await this.prisma.column.findMany({
      where: {
        board_id: boardId,
        id: {
          not: columnId,
        },
        column_number: {
          gte: deletableColumn.column_number,
        },
      },
      orderBy: {
        column_number: 'asc',
      },
    });

    if (columnsToUpdate.length > 0) {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.column.delete({
          where: {
            id: columnId,
            board_id: boardId,
          },
        });

        // Использование цикла for...of для обработки асинхронных операций
        for (const column of columnsToUpdate) {
          await prisma.column.update({
            where: { id: column.id, board_id: boardId },
            data: { column_number: column.column_number - 1 },
          });
        }
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'The column was been deleted successfully',
      };
    }

    await this.prisma.column.delete({
      where: {
        id: columnId,
        board_id: boardId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'The column was been deleted successfully',
    };
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: "The board doesn't exist",
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        statusCode: HttpStatus.OK,
        payload: [
          {
            id: 1,
            name: 'first',
            column_number: 0,
            board_id: 1,
          },
          {
            id: 2,
            name: 'second',
            column_number: 1,
            board_id: 1,
          },
        ],
      },
    },
  })
  async get(@Param('boardId', ParseIntPipe) boardId: number) {
    const board: Board | null = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });
    if (board == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The board doesn't exist",
      };
    }
    const payload: Column[] | null = await this.prisma.column.findMany({
      where: { board_id: boardId },
      orderBy: {
        column_number: 'asc',
      },
    });
    if (payload == null) {
      return { statusCode: HttpStatus.OK, payload: [] };
    }
    return { statusCode: HttpStatus.OK, payload: payload };
  }
}
