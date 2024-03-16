import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { UpdateStatusDtoRequest } from '../requests/updateStatus.dto.request';
import { Status } from '@prisma/client';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('statuses')
@Controller('statuses')
export class StatusController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch(':statusId')
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            id: 99,
            name: 'name',
            color_code: 'FFFFFFFFF',
          },
        ],
        statusCode: HttpStatus.OK,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: ['colorCode must be in uppercase.'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
    description: 'Validation error',
  })
  async update(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body() req: UpdateStatusDtoRequest,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    payload: Status | null;
  }> {
    const existsStatus: Status | null = await this.prisma.status.findUnique({
      where: {
        id: statusId,
      },
    });
    if (existsStatus == null) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'The status you were trying to change does not exist',
        payload: null,
      };
    }
    const status: Status = await this.prisma.status.update({
      where: {
        id: statusId,
      },
      data: {
        name: req?.name,
        color_code: req?.colorCode,
      },
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'The status has been successfully changed',
      payload: status,
    };
  }
}
