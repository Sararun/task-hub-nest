import { Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Board } from '@prisma/client';
import { BoardNotFoundException } from '../exceptions/http/boards/board.not_found.exception';

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
      throw new BoardNotFoundException();
    }
    return boardId;
  }
}
