import { PrismaService } from '../services/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ValidateCommentExistValidator {
  constructor(private readonly prisma: PrismaService) {}

  async transform(commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException(`The column what you wanted doesn't exist`);
    }

    return commentId;
  }
}
