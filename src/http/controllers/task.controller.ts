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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../services/prisma.service';
import { CreateTaskDtoRequest } from '../requests/tasks/createTask.dto.request';
import { Task, User } from '@prisma/client';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateColumnExistsValidator } from '../../validators/validateColumnExists.validator';
import { TransformStatusExistsValidator } from '../../validators/transformStatusExists.validator';
import { UpdateTaskDtoRequest } from '../requests/tasks/updateTask.dto.request';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MinioService } from '../../services/minio.service';
import { ValidateTaskExistsValidator } from '../../validators/validateTaskExists.validator';

@Controller('columns/:columnId/tasks/')
@ApiTags('tasks')
@UseGuards(AuthGuard('jwt'))
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  schema: {
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  },
  description: 'User not authorized',
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  schema: {
    example: {
      message: 'Column not found',
      statusCode: HttpStatus.NOT_FOUND,
    },
  },
})
export class TaskController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    schema: {
      example: {
        payload: {
          id: 11,
          images: null,
          name: 'name',
          description: null,
          deadline: '2024-03-05T14:49:39.907Z',
          owner_id: 1,
          column_id: 5,
          statusId: 1,
          timestamps: '2024-03-04T14:49:39.907Z',
          recepient_id: 1,
          photos: 'http://photo-link',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    schema: {
      example: {
        message: [
          'name should not be empty',
          'name must be shorter than or equal to 255 characters',
          'name must be a string',
        ],
        error: 'Bad request',
        statusCode: 400,
      },
    },
    description: 'Validation error',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  @Post()
  async create(
    @Param('columnId', ParseIntPipe, ValidateColumnExistsValidator)
    columnId: number,
    @Body(TransformStatusExistsValidator) addTaskDto: CreateTaskDtoRequest,
    @Req() request: any,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<{ payload: Task }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });
    if (!user) {
      throw UnauthorizedException;
    }
    let fileUrls: string[] | undefined = undefined;
    if (files) {
      const fileNames = await this.minioService.uploadFiles(files);
      fileUrls = await this.minioService.getFilesUrl(fileNames);
    }
    const addDay = new Date();
    addDay.setDate(addDay.getDate() + 1);
    const task = await this.prisma.task.create({
      data: {
        name: addTaskDto.name,
        description: addTaskDto.description,
        deadline: addTaskDto?.deadline ?? addDay,
        owner_id: user.id,
        column_id: columnId,
        statusId: addTaskDto.statusId ?? 1,
        recepient_id: addTaskDto.recepientId ?? null,
        photos: fileUrls,
        timestamps: new Date(),
      },
    });
    return {
      payload: task,
    };
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            id: 1,
            images: null,
            name: 'task_name',
            description: null,
            deadline: '2024-02-28T20:21:21.168Z',
            owner_id: 1,
            column_id: 4,
            statusId: 1,
            timestamps: '2024-02-26T14:41:42.307Z',
            photos: 'http://photo-link',
          },
          {
            id: 2,
            images: null,
            name: 'task_name',
            description: null,
            deadline: '2024-02-28T20:21:21.168Z',
            owner_id: 1,
            column_id: 4,
            statusId: 1,
            timestamps: '2024-02-26T14:41:47.734Z',
            photos: 'http://photo-link',
          },
        ],
      },
    },
  })
  async get(
    @Param('columnId', ParseIntPipe, ValidateColumnExistsValidator)
    columnId: number,
  ): Promise<{ payload: Task[] | [] }> {
    const task: Task[] | [] = await this.prisma.task.findMany({
      where: {
        column_id: columnId,
      },
    });

    return { payload: task };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: [
          {
            id: 1,
            images: null,
            name: 'task_name',
            description: null,
            deadline: '2024-02-28T20:21:21.168Z',
            owner_id: 1,
            column_id: 4,
            statusId: 1,
            timestamps: '2024-02-26T14:41:42.307Z',
            photos: 'http://photo-link',
          },
        ],
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Patch(':taskId')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('columnId', ParseIntPipe, ValidateColumnExistsValidator)
    columnId: number,
    @Param('taskId', ParseIntPipe, ValidateTaskExistsValidator) taskId: number,
    @Body(TransformStatusExistsValidator) updateTaskDto: UpdateTaskDtoRequest,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<{ payload: Task }> {
    let deletedFileUrls: string[] | undefined = undefined;
    let newPhotoList: string[] | undefined = undefined;

    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new UnauthorizedException();
    }
    if (task.photos) {
      // @ts-ignore
      const photoCopy: string[] = [...task.photos];

      if (updateTaskDto.deletedImagesId) {
        deletedFileUrls = updateTaskDto.deletedImagesId
          .map((deletedImageId: number): string => {
            // @ts-ignore
            return task.photos[deletedImageId];
          })
          .filter((url) => url !== undefined);
        if (deletedFileUrls) {
          const fileNames =
            await this.minioService.parseNameFromUrls(deletedFileUrls);
          await this.minioService.deleteFiles(fileNames);
        }
      }
      // @ts-ignore
      newPhotoList = photoCopy
        .map((photo: string, index: number) => {
          if (
            !updateTaskDto.deletedImagesId ||
            !updateTaskDto.deletedImagesId[index]
          ) {
            return photo;
          }
        })
        .filter((url: undefined) => url !== undefined);
    }

    if (files) {
      const fileNames = await this.minioService.uploadFiles(files);
      const fileUrls = await this.minioService.getFilesUrl(fileNames);
      if (newPhotoList) {
        newPhotoList = [...newPhotoList, ...fileUrls];
      } else {
        newPhotoList = [...fileUrls];
      }
    }

    const newTask = await this.prisma.task.update({
      where: {
        id: taskId,
        column_id: columnId,
      },
      data: {
        name: updateTaskDto.name,
        description: updateTaskDto.description,
        deadline: updateTaskDto.deadline,
        column_id: columnId,
        statusId: updateTaskDto?.statusId,
        photos: newPhotoList,
      },
    });
    return { payload: newTask };
  }

  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        payload: null,
      },
    },
    description: 'Task was been deleted successfully',
  })
  @Delete(':taskId')
  async delete(
    @Param('columnId', ParseIntPipe, ValidateColumnExistsValidator)
    columnId: number,
    @Param('taskId', ParseIntPipe, ValidateTaskExistsValidator) taskId: number,
    @Req() request: any,
  ): Promise<{ payload: null }> {
    const user: User | null = await this.prisma.user.findUnique({
      where: {
        email: request.user.email,
      },
    });
    if (!user) {
      throw UnauthorizedException;
    }
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      if (task.photos) {
        const photoNames = await this.minioService.parseNameFromUrls(
          task.photos as string[],
        );
        await this.minioService.deleteFiles(photoNames);
      }
    }
    await this.prisma.task.delete({
      where: {
        owner_id: user.id,
        column_id: columnId,
        id: taskId,
      },
    });

    return {
      payload: null,
    };
  }
}
