import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../services/prisma.service';

@Injectable()
@ValidatorConstraint()
export class CommentExistsValidator implements ValidatorConstraintInterface {
  async validate(commentId: number): Promise<boolean> {
    const comment = await new PrismaService().comment.findUnique({
      where: {
        id: commentId,
      },
    });
    return !!comment;
  }

  defaultMessage(): string {
    return 'Comment with id $value is not exist';
  }
}
