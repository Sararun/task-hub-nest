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
import { Status, StatusEnum } from '@prisma/client';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatusNotFoundException } from '../../exceptions/http/statusses/status.not_found.exception';

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
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    schema: {
      example: {
        message: 'Status not found',
        statusCode: HttpStatus.NOT_FOUND,
      },
    },
  })
  async update(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body() req: UpdateStatusDtoRequest,
  ): Promise<{ payload: Status }> {
    const existsStatus: Status | null = await this.prisma.status.findUnique({
      where: {
        id: statusId,
      },
    });
    if (existsStatus == null) {
      throw new StatusNotFoundException();
    }
    const status: Status = await this.prisma.status.update({
      where: {
        id: statusId,
      },
      data: {
        name: req?.name as StatusEnum,
        color_code: req?.colorCode,
      },
    });
    return {
      payload: status,
    };
  }
}
