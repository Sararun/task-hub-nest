import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SetProfileDataDtoRequest } from '../requests/setProfileData.dto.request';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../services/prisma.service';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from '../../services/minio.service';

@Controller('profile')
@ApiTags('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: {
          email: 'email@mail.com',
          name: 'John Doe',
          photo: 'http://photo-link',
        },
      },
    },
    description: 'Profile',
  })
  async get(@Req() request: any) {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });
    return {
      payload: {
        email: user?.email,
        name: user?.name,
        photo: user?.photo,
      },
    };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: {
          email: 'email@mail.com',
          name: 'name',
          photo: 'http://photo-link',
        },
      },
    },
    description: 'User successfully updated.',
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
  @Patch('')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Body() setProfileDto: SetProfileDataDtoRequest,
    @Req() request: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    let fileUrl: string | undefined = undefined;
    if (file) {
      if (user.photo) {
        const fileName = this.minioService.parseNameFromUrl(user.photo);
        await this.minioService.deleteFile(fileName);
      }

      const newFileName = await this.minioService.uploadFile(file);
      fileUrl = await this.minioService.getFileUrl(newFileName);
    }
    const updatedUser = await this.prisma.user.update({
      data: {
        name: setProfileDto?.name,
        photo: fileUrl,
      },
      where: {
        id: user.id,
      },
    });
    return {
      payload: {
        email: updatedUser.email,
        name: updatedUser.name,
        photo: fileUrl,
      },
    };
  }

  @Get('/search')
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: [
        {
          id: 1,
          name: 'pppppppppppppppppppppppppppppp',
          email: 'email@gmail.com',
          photo: 'http://localhost:9000/mybucketname/',
        },
        {
          id: 2,
          name: 'vlad_sarosek',
          email: 'emcail@gmail.com',
          photo: null,
        },
      ],
    },
    description: 'Validation error',
  })
  async search(@Query('name') name: string) {
    const users = await this.prisma.user.findMany({
      where: {
        name: {
          search: name,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
      },
    });

    return { payload: users };
  }
}
