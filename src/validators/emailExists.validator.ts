import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../services/prisma.service';
import { Injectable } from '@nestjs/common';
@Injectable()
@ValidatorConstraint()
export class EmailExistsValidator implements ValidatorConstraintInterface {
  async validate(email: string): Promise<boolean> {
    const user = await new PrismaService().user.findUnique({
      where: {
        email: email,
      },
    });
    return !user;
  }

  defaultMessage(): string {
    return 'Email $value is already in use';
  }
}
