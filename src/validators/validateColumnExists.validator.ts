import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class ValidateColumnExistsValidator implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(columnId: number) {
    const column = await this.prisma.column.findUnique({
      where: {
        id: columnId,
      },
    });

    if (!column) {
      throw new NotFoundException(`The column what you wanted doesn't exist`);
    }

    return columnId;
  }
}
