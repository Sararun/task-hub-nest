import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SetProfileDataDtoRequest } from '../requests/setProfileData.dto.request';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../services/prisma.service';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('profile')
@ApiTags('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private prisma: PrismaService) {}

  @ApiParam({
    name: 'name',
    description: 'The name of user',
    example: 'John Doe',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        statusCode: HttpStatus.OK,
      },
    },
    description: 'User successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    schema: {
      example: {
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
    status: HttpStatus.UNAUTHORIZED,
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
      },
    },
    description: 'User not authorized',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: ['name must be shorter than or equal to 255 characters'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
    description: 'Validation error',
  })
  @Patch('set-name')
  @HttpCode(HttpStatus.OK)
  async setProfileData(
    @Body() setProfileDto: SetProfileDataDtoRequest,
    @Req() request: any,
  ): Promise<{ statusCode: HttpStatus }> {
    try {
      const updatedUser: User = await this.prisma.user.update({
        where: {
          email: request.user.email,
        },
        data: {
          name: setProfileDto.name,
        },
      });
      if (!!updatedUser) {
        return { statusCode: HttpStatus.OK };
      }
      return { statusCode: HttpStatus.NOT_FOUND };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @Get('get')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        email: 'email@mail.com',
        name: 'John Doe',
        statusCode: HttpStatus.OK,
      },
    },
    description: 'Profile',
  })
  async get(@Req() request: any): Promise<{
    statusCode: HttpStatus;
    email: string | null | undefined;
    name: string | null | undefined;
  }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      email: user?.email,
      name: user?.name,
    };
  }
}
