import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { AddColumnDtoRequest } from '../requests/addColumn.dto.request';
import { UpdateColumnDtoRequest } from '../requests/updateColumn.dto.request';
import { Column } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('columns')
@ApiTags('columns')
@UseGuards(AuthGuard('jwt'))
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    example: {
      message: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED,
    },
  },
  description: 'User not authorized',
})
export class ColumnController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        message: 'Column was been successfully created',
        statusCode: HttpStatus.CREATED,
      },
    },
    description: 'Internal server error.',
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
  @Post()
  async create(@Body() addColumnDto: AddColumnDtoRequest): Promise<{
    statusCode: HttpStatus.CREATED;
    message: 'Column was been successfully created';
  }> {
    const column: { _max: { column_number: number | null } } =
      await this.prisma.column.aggregate({
        _max: {
          column_number: true,
        },
      });

    let columnMaxNumber: number;
    if (column._max.column_number === null) {
      columnMaxNumber = 0;
    } else {
      columnMaxNumber = column._max.column_number + 1;
    }

    await this.prisma.column.create({
      data: {
        name: addColumnDto.name,
        column_number: columnMaxNumber,
      },
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Column was been successfully created',
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
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) columnId: number,
    @Body() updateColumnDto: UpdateColumnDtoRequest,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
  }> {
    const updatableColumn: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
      },
    });

    if (updatableColumn == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "The column what you want to update doesn't exist",
      };
    }

    const existColumnNumber: Column | null = await this.prisma.column.findFirst(
      {
        where: {
          column_number: updateColumnDto.columnNumber,
        },
      },
    );

    if (existColumnNumber != null) {
      const columnsToUpdate = await this.prisma.column.findMany({
        where: {
          column_number: {
            gte: updateColumnDto.columnNumber,
          },
        },
      });

      if (columnsToUpdate.length > 0) {
        const updatePromises = columnsToUpdate.map((column: Column) => {
          return this.prisma.column.update({
            where: { id: column.id },
            data: { column_number: column.column_number + 1 },
          });
        });

        updatePromises.push(
          this.prisma.column.update({
            where: { id: columnId },
            data: {
              name: updateColumnDto.name,
              column_number: updateColumnDto.columnNumber,
            },
          }),
        );

        try {
          await this.prisma.$transaction(updatePromises);
        } catch (error) {
          throw new InternalServerErrorException();
        }

        return {
          statusCode: HttpStatus.OK,
          message: 'The column was been updated successfully',
        };
      }
    }

    await this.prisma.column.update({
      where: {
        id: columnId,
      },
      data: {
        name: updateColumnDto?.name,
        column_number: updateColumnDto?.columnNumber,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'The column was been updated successfully',
    };
  }

  @Delete(':id')
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
    description: 'Internal server error.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        message: 'The column was been deleted successfully',
        statusCode: HttpStatus.OK,
      },
    },
    description: 'The column was been deleted successfully.',
  })
  async delete(@Param('id', ParseIntPipe) columnId: number): Promise<{
    statusCode: HttpStatus;
    message: string;
  }> {
    const deletableColumn: Column | null = await this.prisma.column.findUnique({
      where: {
        id: columnId,
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
        column_number: {
          gte: deletableColumn.column_number,
        },
      },
    });

    if (columnsToUpdate.length > 0) {
      const updatePromises = columnsToUpdate.map((column: Column) => {
        return this.prisma.column.update({
          where: { id: column.id },
          data: { column_number: column.column_number - 1 },
        });
      });

      updatePromises.push(
        this.prisma.column.delete({
          where: {
            id: columnId,
          },
        }),
      );

      try {
        await this.prisma.$transaction(updatePromises);
      } catch (error) {
        throw new InternalServerErrorException();
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'The column was been deleted successfully',
      };
    }

    await this.prisma.column.delete({
      where: {
        id: columnId,
      },
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'The column was been deleted successfully',
    };
  }
}
