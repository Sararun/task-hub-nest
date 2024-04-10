import { Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { ColumnNotFoundException } from '../exceptions/http/columns/column.not_found.exception';

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
      throw new ColumnNotFoundException();
    }

    return columnId;
  }
}
