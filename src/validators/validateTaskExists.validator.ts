import { PrismaService } from '../services/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ValidateTaskExistsValidator {
  constructor(private readonly prisma: PrismaService) {}

  async transform(taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException(`The task what you wanted doesn't exist`);
    }

    return taskId;
  }
}
