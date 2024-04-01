import { Injectable, PipeTransform } from '@nestjs/common';
import { Status } from '@prisma/client';
import { StatusEnum } from '../enums/status.enum';
import { PrismaService } from '../services/prisma.service';
import { CreateTaskDtoRequest } from '../http/requests/tasks/createTask.dto.request';

@Injectable()
export class TransformStatusExistsValidator implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(addTaskDto: CreateTaskDtoRequest) {
    if (addTaskDto.statusId != undefined) {
      const existsStatus: Status | null = await this.prisma.status.findUnique({
        where: { id: addTaskDto.statusId },
      });

      if (existsStatus) {
        addTaskDto.statusId = existsStatus.id;
      } else {
        const status = await this.prisma.status.findFirst({
          where: { name: StatusEnum.NotStatus },
          select: { id: true },
        });
        addTaskDto.statusId = status?.id ?? 1;
      }
    } else {
      const status = await this.prisma.status.findFirst({
        where: { name: StatusEnum.NotStatus },
        select: { id: true },
      });
      addTaskDto.statusId = status?.id ?? 1;
    }
    return addTaskDto;
  }
}
