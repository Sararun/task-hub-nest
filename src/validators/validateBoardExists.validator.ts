import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Board } from '@prisma/client';

@Injectable()
export class ValidateBoardExistsValidator implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(boardId: number) {
    const board: Board | null = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });
    if (!board) {
      throw new NotFoundException('The board does not exist');
    }
    return boardId;
  }
}
