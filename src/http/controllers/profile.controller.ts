import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SetProfileDataDtoRequest } from '../requests/setProfileData.dto.request';
import { AuthGuard } from '../../auth.guard';
import { PrismaService } from '../../services/prisma.service';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('profile')
@ApiTags('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private prisma: PrismaService) {}

  @Patch('set-name')
  @ApiParam({
    name: 'name',
    description: 'The name of user',
    example: 'John Doe',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully updated.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found.' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authorized',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  async setProfileData(
    @Body() setProfileDto: SetProfileDataDtoRequest,
    @Req() request: any,
  ): Promise<{ status: HttpStatus }> {
    try {
      const updatedUser: User = await this.prisma.user.update({
        where: {
          id: request.user.sub,
        },
        data: {
          name: setProfileDto.name,
        },
      });
      if (!!updatedUser) {
        return { status: HttpStatus.OK };
      }
      return { status: HttpStatus.NOT_FOUND };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
